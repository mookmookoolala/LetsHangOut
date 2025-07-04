package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// Enable CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// API handler for the /api endpoint
func apiHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"message": "hello world mty bro"}
	json.NewEncoder(w).Encode(response)
}

// Root handler
func rootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to Letshangout API! Use /api endpoint for data.")
}

// User and Group data structures
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Group struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Code    string `json:"code"`
	Members []int  `json:"members"` // User IDs
	AdminID int    `json:"admin_id"`
}

var users = make(map[int]User)
var groups = make(map[int]Group)
var userIDCounter = 1
var groupIDCounter = 1
var db *sql.DB // Global DB connection

// Handler for user registration
func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[DEBUG] Invalid request body:", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	fmt.Println("[DEBUG] Registering user:", req.Username)
	// Check if username already exists
	var exists int
	var existingID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", req.Username).Scan(&existingID)
	if err == nil {
		// User exists, return their ID
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"id": existingID, "username": req.Username})
		return
	}
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", req.Username).Scan(&exists)
	if err != nil {
		fmt.Println("[DEBUG] DB error on SELECT:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if exists > 0 {
		fmt.Println("[DEBUG] Username already exists:", req.Username)
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}
	// Insert user into MySQL
	result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", req.Username, req.Password)
	if err != nil {
		fmt.Println("[DEBUG] DB error on INSERT:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		fmt.Println("[DEBUG] DB error on LastInsertId:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("[DEBUG] User registered with ID:", id)
	user := User{ID: int(id), Username: req.Username, Password: req.Password}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func generateGroupCode(n int) string {
	letters := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	rand.Seed(time.Now().UnixNano())
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func createGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Name     string      `json:"name"`
		UserID   interface{} `json:"user_id"`
		Username string      `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	code := generateGroupCode(6)
	var userID int
	// Check if user exists
	switch v := req.UserID.(type) {
	case float64:
		// Try to find user by ID
		err := db.QueryRow("SELECT id FROM users WHERE id = ?", int(v)).Scan(&userID)
		if err != nil {
			// Not found, treat as guest
			if req.Username == "" {
				http.Error(w, "Missing username for guest", http.StatusBadRequest)
				return
			}
			result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, '')", req.Username)
			if err != nil {
				http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			id, _ := result.LastInsertId()
			userID = int(id)
		}
	case string:
		// Guest user, create in DB
		if req.Username == "" {
			http.Error(w, "Missing username for guest", http.StatusBadRequest)
			return
		}
		result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, '')", req.Username)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		id, _ := result.LastInsertId()
		userID = int(id)
	default:
		http.Error(w, "Invalid user_id", http.StatusBadRequest)
		return
	}
	result, err := db.Exec("INSERT INTO `groups` (name, code, admin_id) VALUES (?, ?, ?)", req.Name, code, userID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	groupID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Add creator to group_members
	if userID > 0 {
		_, err = db.Exec("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", groupID, userID)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	resp := map[string]interface{}{"id": groupID, "name": req.Name, "code": code, "admin_id": userID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func joinGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Code   string `json:"code"`
		UserID int    `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	var groupID int
	err := db.QueryRow("SELECT id FROM `groups` WHERE code = ?", req.Code).Scan(&groupID)
	if err != nil {
		http.Error(w, "Invalid group code", http.StatusNotFound)
		return
	}
	// Check if user is already a member
	var exists int
	err = db.QueryRow("SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ?", groupID, req.UserID).Scan(&exists)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if exists > 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"group_id": groupID, "user_id": req.UserID, "already_member": true})
		return
	}
	// Add user to group_members
	_, err = db.Exec("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", groupID, req.UserID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	resp := map[string]interface{}{"group_id": groupID, "user_id": req.UserID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Event data structure
type Event struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`       // ISO format (YYYY-MM-DD)
	CreatedBy   int    `json:"created_by"` // User ID
}

var events = make(map[int]Event)
var eventIDCounter = 1

// Handler for creating an event
func createEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Date        string `json:"date"`
		CreatedBy   int    `json:"created_by"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	event := Event{ID: eventIDCounter, Title: req.Title, Description: req.Description, Date: req.Date, CreatedBy: req.CreatedBy}
	events[eventIDCounter] = event
	eventIDCounter++
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// Handler for listing events
func listEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	eventList := make([]Event, 0, len(events))
	for _, event := range events {
		eventList = append(eventList, event)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(eventList)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers for direct requests
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	var user User
	err := db.QueryRow("SELECT id, username, password FROM users WHERE username = ?", req.Username).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	if user.Password != req.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func connectToDB() (*sql.DB, error) {
	dsn := "root:root@tcp(195.85.19.115:3306)/letshangoutapp1"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func myGroupsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "Missing user_id", http.StatusBadRequest)
		return
	}
	rows, err := db.Query(
		"SELECT g.id, g.name, g.code, g.admin_id FROM group_members gm JOIN `groups` g ON gm.group_id = g.id WHERE gm.user_id = ?",
		userID,
	)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var groups []Group
	for rows.Next() {
		var g Group
		if err := rows.Scan(&g.ID, &g.Name, &g.Code, &g.AdminID); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		groups = append(groups, g)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// Propose a new date for a group
func proposeDateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		GroupID    int    `json:"group_id"`
		Date       string `json:"date"`
		EndDate    string `json:"end_date"`
		Time       string `json:"time"`
		ProposedBy int    `json:"proposed_by"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	_, err := db.Exec(
		"INSERT INTO event_dates (group_id, date, end_date, time, proposed_by) VALUES (?, ?, ?, ?, ?)",
		req.GroupID, req.Date, req.EndDate, req.Time, req.ProposedBy,
	)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Vote for a proposed date
func voteDateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		EventDateID int  `json:"event_date_id"`
		UserID      int  `json:"user_id"`
		Available   bool `json:"available"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Upsert: if vote exists, update; else insert
	_, err := db.Exec(`REPLACE INTO date_votes (event_date_id, user_id, available) VALUES (?, ?, ?)`, req.EventDateID, req.UserID, req.Available)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Get all proposed dates and votes for a group
func groupDatesHandler(w http.ResponseWriter, r *http.Request) {
	groupID := r.URL.Query().Get("group_id")
	if groupID == "" {
		http.Error(w, "Missing group_id", http.StatusBadRequest)
		return
	}
	rows, err := db.Query(`
		SELECT ed.id, ed.date, ed.end_date, ed.time, ed.proposed_by, u.username,
			   COALESCE(SUM(CASE WHEN dv.available = 1 THEN 1 ELSE 0 END), 0) as available_votes,
			   COALESCE(SUM(CASE WHEN dv.available = 0 THEN 1 ELSE 0 END), 0) as not_available_votes
		FROM event_dates ed
		LEFT JOIN date_votes dv ON ed.id = dv.event_date_id
		LEFT JOIN users u ON ed.proposed_by = u.id
		WHERE ed.group_id = ?
		GROUP BY ed.id, ed.date, ed.end_date, ed.time, ed.proposed_by, u.username
		ORDER BY ed.date ASC, ed.time ASC`, groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var dates []map[string]interface{}
	for rows.Next() {
		var id, proposedBy, availableVotes, notAvailableVotes int
		var date, endDate, username string
		var timeNull sql.NullString
		if err := rows.Scan(&id, &date, &endDate, &timeNull, &proposedBy, &username, &availableVotes, &notAvailableVotes); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		var timeStr string
		if timeNull.Valid {
			timeStr = timeNull.String
		} else {
			timeStr = ""
		}
		dates = append(dates, map[string]interface{}{
			"id": id, "date": date, "end_date": endDate, "time": timeStr, "proposed_by": proposedBy, "proposed_by_username": username,
			"available_votes": availableVotes, "not_available_votes": notAvailableVotes,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dates)
}

// Delete a proposed date (only by proposer)
func deleteProposedDateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		EventDateID int `json:"event_date_id"`
		UserID      int `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Check if the user is the proposer
	var proposerID int
	err := db.QueryRow("SELECT proposed_by FROM event_dates WHERE id = ?", req.EventDateID).Scan(&proposerID)
	if err != nil {
		http.Error(w, "Event date not found", http.StatusNotFound)
		return
	}
	if proposerID != req.UserID {
		http.Error(w, "You can only delete your own proposed dates", http.StatusForbidden)
		return
	}
	// Delete related votes first
	_, err = db.Exec("DELETE FROM date_votes WHERE event_date_id = ?", req.EventDateID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Delete the event date
	_, err = db.Exec("DELETE FROM event_dates WHERE id = ?", req.EventDateID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Task struct
type Task struct {
	ID          int    `json:"id"`
	GroupID     int    `json:"group_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	AssigneeID  int    `json:"assignee_id"`
	Status      string `json:"status"`
}

// Add a new task
func addTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		GroupID     int    `json:"group_id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		DueDate     string `json:"due_date"`
		AssigneeID  int    `json:"assignee_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	result, err := db.Exec("INSERT INTO tasks (group_id, title, description, due_date, assignee_id, status) VALUES (?, ?, ?, ?, ?, ?)", req.GroupID, req.Title, req.Description, req.DueDate, req.AssigneeID, "todo")
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := result.LastInsertId()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id})
}

// List all tasks for a group
func groupTasksHandler(w http.ResponseWriter, r *http.Request) {
	groupID := r.URL.Query().Get("group_id")
	if groupID == "" {
		http.Error(w, "Missing group_id", http.StatusBadRequest)
		return
	}
	rows, err := db.Query("SELECT id, group_id, title, description, due_date, assignee_id, status FROM tasks WHERE group_id = ?", groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var tasks []Task
	for rows.Next() {
		var t Task
		if err := rows.Scan(&t.ID, &t.GroupID, &t.Title, &t.Description, &t.DueDate, &t.AssigneeID, &t.Status); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, t)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// Assign a user to a task
func assignTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		TaskID     int `json:"task_id"`
		AssigneeID int `json:"assignee_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	_, err := db.Exec("UPDATE tasks SET assignee_id = ? WHERE id = ?", req.AssigneeID, req.TaskID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Mark a task as completed
func completeTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		TaskID int `json:"task_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	_, err := db.Exec("UPDATE tasks SET status = 'done' WHERE id = ?", req.TaskID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Delete a task
func deleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		TaskID int `json:"task_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	_, err := db.Exec("DELETE FROM tasks WHERE id = ?", req.TaskID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// List all members of a group
func groupMembersHandler(w http.ResponseWriter, r *http.Request) {
	groupID := r.URL.Query().Get("group_id")
	if groupID == "" {
		http.Error(w, "Missing group_id", http.StatusBadRequest)
		return
	}
	rows, err := db.Query(`SELECT u.id, u.username FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?`, groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var members []map[string]interface{}
	for rows.Next() {
		var id int
		var username string
		if err := rows.Scan(&id, &username); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		members = append(members, map[string]interface{}{"id": id, "username": username})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

// Expense struct
type Expense struct {
	ID          int     `json:"id"`
	GroupID     int     `json:"group_id"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	PaidBy      int     `json:"paid_by"`
	Date        string  `json:"date"`
	Category    string  `json:"category"`
}

// Add a new expense
func addExpenseHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("[DEBUG] addExpenseHandler called")
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		GroupID     int     `json:"group_id"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
		PaidBy      int     `json:"paid_by"`
		Date        string  `json:"date"`
		Category    string  `json:"category"`
		SplitWith   []int   `json:"split_with"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	result, err := db.Exec("INSERT INTO expenses (group_id, description, amount, paid_by, date, category) VALUES (?, ?, ?, ?, ?, ?)", req.GroupID, req.Description, req.Amount, req.PaidBy, req.Date, req.Category)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	expenseID, _ := result.LastInsertId()
	// Split equally if split_with provided
	if len(req.SplitWith) > 0 {
		splitAmount := req.Amount / float64(len(req.SplitWith))
		for _, uid := range req.SplitWith {
			_, err := db.Exec("INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)", expenseID, uid, splitAmount)
			if err != nil {
				http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": expenseID})
}

// List all expenses for a group
func groupExpensesHandler(w http.ResponseWriter, r *http.Request) {
	groupID := r.URL.Query().Get("group_id")
	if groupID == "" {
		http.Error(w, "Missing group_id", http.StatusBadRequest)
		return
	}
	rows, err := db.Query("SELECT id, group_id, description, amount, paid_by, date, category FROM expenses WHERE group_id = ? ORDER BY date DESC, id DESC", groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var expenses []Expense
	for rows.Next() {
		var e Expense
		if err := rows.Scan(&e.ID, &e.GroupID, &e.Description, &e.Amount, &e.PaidBy, &e.Date, &e.Category); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		expenses = append(expenses, e)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(expenses)
}

// Group balances: who owes whom
func groupBalancesHandler(w http.ResponseWriter, r *http.Request) {
	groupID := r.URL.Query().Get("group_id")
	if groupID == "" {
		http.Error(w, "Missing group_id", http.StatusBadRequest)
		return
	}
	// Get all users in group
	userRows, err := db.Query("SELECT u.id, u.username FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?", groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer userRows.Close()
	users := map[int]string{}
	for userRows.Next() {
		var id int
		var username string
		if err := userRows.Scan(&id, &username); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		users[id] = username
	}
	// Calculate balances
	balances := map[int]float64{} // user_id -> net balance
	// Each expense: paid_by gets +amount, split_with gets -split
	expRows, err := db.Query("SELECT id, amount, paid_by FROM expenses WHERE group_id = ?", groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer expRows.Close()
	for expRows.Next() {
		var eid, paidBy int
		var amount float64
		if err := expRows.Scan(&eid, &amount, &paidBy); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// Get splits
		splitRows, err := db.Query("SELECT user_id, amount FROM expense_splits WHERE expense_id = ?", eid)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		splitCount := 0
		for splitRows.Next() {
			var uid int
			var splitAmt float64
			if err := splitRows.Scan(&uid, &splitAmt); err != nil {
				http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
				splitRows.Close()
				return
			}
			balances[uid] -= splitAmt
			splitCount++
		}
		splitRows.Close()
		// Paid by gets full amount back
		balances[paidBy] += amount
	}
	// Prepare summary
	summary := []map[string]interface{}{}
	for uid, bal := range balances {
		summary = append(summary, map[string]interface{}{
			"user_id":  uid,
			"username": users[uid],
			"balance":  bal,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// Update a task
func updateTaskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		TaskID      int    `json:"task_id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		DueDate     string `json:"due_date"`
		AssigneeID  int    `json:"assignee_id"`
		Status      string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	set := []string{}
	args := []interface{}{}
	if req.Title != "" {
		set = append(set, "title = ?")
		args = append(args, req.Title)
	}
	if req.Description != "" {
		set = append(set, "description = ?")
		args = append(args, req.Description)
	}
	if req.DueDate != "" {
		set = append(set, "due_date = ?")
		args = append(args, req.DueDate)
	}
	if req.AssigneeID != 0 {
		set = append(set, "assignee_id = ?")
		args = append(args, req.AssigneeID)
	}
	if req.Status != "" {
		set = append(set, "status = ?")
		args = append(args, req.Status)
	}
	if len(set) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}
	query := "UPDATE tasks SET " + strings.Join(set, ", ") + " WHERE id = ?"
	args = append(args, req.TaskID)
	_, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// After addExpenseHandler
func deleteExpenseHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ExpenseID int `json:"expense_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Delete splits for this expense first
	_, err := db.Exec("DELETE FROM expense_splits WHERE expense_id = ?", req.ExpenseID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Then delete from expenses table
	_, err = db.Exec("DELETE FROM expenses WHERE id = ?", req.ExpenseID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{\"success\":true}"))
}

// Handler to add an external member to a group
func addExternalMemberHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		GroupID int    `json:"group_id"`
		Name    string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if req.Name == "" || req.GroupID == 0 {
		http.Error(w, "Missing name or group_id", http.StatusBadRequest)
		return
	}
	// Generate a unique username for the external member
	extUsername := req.Name
	// Ensure uniqueness by appending a random number if needed
	var exists int
	baseUsername := extUsername
	for i := 0; i < 10; i++ {
		err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", extUsername).Scan(&exists)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if exists == 0 {
			break
		}
		extUsername = fmt.Sprintf("%s_%d", baseUsername, rand.Intn(10000))
	}
	// Insert into users table (no password)
	result, err := db.Exec("INSERT INTO users (username, password) VALUES (?, '')", extUsername)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	userID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Add to group_members
	_, err = db.Exec("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", req.GroupID, userID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	resp := map[string]interface{}{
		"id":   userID,
		"name": extUsername,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	var err error
	db, err = connectToDB()
	if err != nil {
		fmt.Printf("Failed to connect to MySQL: %v\n", err)
	} else {
		fmt.Println("Successfully connected to MySQL database!")
		defer db.Close()
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/my-groups", myGroupsHandler)
	mux.HandleFunc("/", rootHandler)
	mux.HandleFunc("/api", apiHandler)
	mux.HandleFunc("/register", registerHandler)
	mux.HandleFunc("/groups", createGroupHandler)
	mux.HandleFunc("/join-group", joinGroupHandler)
	mux.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			createEventHandler(w, r)
		} else if r.Method == http.MethodGet {
			listEventsHandler(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/login", loginHandler)
	mux.HandleFunc("/propose-date", proposeDateHandler)
	mux.HandleFunc("/vote-date", voteDateHandler)
	mux.HandleFunc("/group-dates", groupDatesHandler)
	mux.HandleFunc("/delete-proposed-date", deleteProposedDateHandler)
	mux.HandleFunc("/add-task", addTaskHandler)
	mux.HandleFunc("/group-tasks", groupTasksHandler)
	mux.HandleFunc("/assign-task", assignTaskHandler)
	mux.HandleFunc("/complete-task", completeTaskHandler)
	mux.HandleFunc("/delete-task", deleteTaskHandler)
	mux.HandleFunc("/group-members", groupMembersHandler)
	mux.HandleFunc("/add-expense", addExpenseHandler)
	mux.HandleFunc("/group-expenses", groupExpensesHandler)
	mux.HandleFunc("/group-balances", groupBalancesHandler)
	mux.HandleFunc("/update-task", updateTaskHandler)
	mux.HandleFunc("/api/delete-expense", deleteExpenseHandler)
	mux.HandleFunc("/delete-expense", deleteExpenseHandler)
	mux.HandleFunc("/api/group-members", groupMembersHandler)
	mux.HandleFunc("/api/add-expense", addExpenseHandler)
	mux.HandleFunc("/api/add-external-member", addExternalMemberHandler)
	mux.HandleFunc("/add-external-member", addExternalMemberHandler)

	// Apply CORS middleware
	handler := enableCORS(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	fmt.Printf("Starting server on port %s\n", port)
	if err := http.ListenAndServe("127.0.0.1:"+port, handler); err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
