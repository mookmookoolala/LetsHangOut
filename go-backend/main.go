package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
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
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", req.Username).Scan(&exists)
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
		Name   string `json:"name"`
		UserID int    `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	code := generateGroupCode(6)
	result, err := db.Exec("INSERT INTO `groups` (name, code) VALUES (?, ?)", req.Name, code)
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
	if req.UserID > 0 {
		_, err = db.Exec("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", groupID, req.UserID)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	resp := map[string]interface{}{"id": groupID, "name": req.Name, "code": code}
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
		"SELECT g.id, g.name, g.code FROM group_members gm JOIN `groups` g ON gm.group_id = g.id WHERE gm.user_id = ?",
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
		if err := rows.Scan(&g.ID, &g.Name, &g.Code); err != nil {
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
		Date       string `json:"date"` // YYYY-MM-DD
		Time       string `json:"time"`
		ProposedBy int    `json:"proposed_by"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Println("[DEBUG] Invalid request body for proposeDateHandler:", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] Proposing date: group_id=%d, date=%s, time=%s, proposed_by=%d\n", req.GroupID, req.Date, req.Time, req.ProposedBy)
	result, err := db.Exec("INSERT INTO event_dates (group_id, date, time, proposed_by) VALUES (?, ?, ?, ?)", req.GroupID, req.Date, req.Time, req.ProposedBy)
	if err != nil {
		fmt.Println("[DEBUG] DB error on INSERT event_dates:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		fmt.Println("[DEBUG] DB error on LastInsertId event_dates:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	resp := map[string]interface{}{"id": id, "group_id": req.GroupID, "date": req.Date, "time": req.Time, "proposed_by": req.ProposedBy}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
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
		SELECT ed.id, ed.date, ed.time, ed.proposed_by, u.username,
			   COALESCE(SUM(CASE WHEN dv.available = 1 THEN 1 ELSE 0 END), 0) as available_votes,
			   COALESCE(SUM(CASE WHEN dv.available = 0 THEN 1 ELSE 0 END), 0) as not_available_votes
		FROM event_dates ed
		LEFT JOIN date_votes dv ON ed.id = dv.event_date_id
		LEFT JOIN users u ON ed.proposed_by = u.id
		WHERE ed.group_id = ?
		GROUP BY ed.id, ed.date, ed.time, ed.proposed_by, u.username
		ORDER BY ed.date ASC, ed.time ASC`, groupID)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var dates []map[string]interface{}
	for rows.Next() {
		var id, proposedBy, availableVotes, notAvailableVotes int
		var date, timeStr, username string
		if err := rows.Scan(&id, &date, &timeStr, &proposedBy, &username, &availableVotes, &notAvailableVotes); err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		dates = append(dates, map[string]interface{}{
			"id": id, "date": date, "time": timeStr, "proposed_by": proposedBy, "proposed_by_username": username,
			"available_votes": availableVotes, "not_available_votes": notAvailableVotes,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dates)
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

	// Apply CORS middleware
	handler := enableCORS(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on port %s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
