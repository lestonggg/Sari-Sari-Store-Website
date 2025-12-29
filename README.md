# 🛒 JORAMS' Store Management System

A Django-based Point of Sale (POS) and Inventory Management system.

## 🚀 How to Start

Follow these steps to get the project running on your laptop or computer:

### Step 1: Open GitHub

Open your web browser and go to the project page on **github.com**.

### Step 2: Copy the Project Link

Click the green **"Code"** button. Make sure **HTTPS** is selected, then copy the repository link.

### Step 3: Clone the Project

On your laptop or computer, open **cmd** (Command Prompt). Type the following command and press Enter:
`git clone https://<paste-your-repo-link-here>`

### Step 4: Enter the Project Folder

In the same cmd window, type this command to enter the project folder:
`cd <name-of-the-project-folder>`

### Step 5: Open in VS Code

Type the following command to open the project in **Visual Studio Code**:
`code .`

### Step 6: Open the Terminal

In VS Code, press **Ctrl + Shift + `** or go to the top menu: **... (Triple Dots)** -> **Terminal** -> **New Terminal**.

> **NOTE:** Double-check that your terminal path matches your project folder.

### Step 7: Activate the Virtual Environment

**If you DON'T have a .venv folder yet:** Type this command to create your "private room" first: `python -m venv .venv`

Type this command to start your isolated Python environment:
`.venv\Scripts\activate`

- **Why do this?** This creates a "private room" for your project. It ensures that the libraries you install here do not interfere with other Python projects on your laptop or computer.
- **How to exit?** When you are finished working, simply type `deactivate` in the terminal to leave the "private room" and go back to your normal laptop or computer settings.

### Step 8: Install All Libraries

Instead of downloading libraries one by one, type this command to install everything at once:
`pip install -r requirements.txt`

- This file contains the full list of tools (like Django and Decimal) needed for the website to work.

### Step 9: Run the Project

Type this command to start the local server:
`python manage.py runserver`

- Find the link `http://127.0.0.1:8000/` in the terminal. Copy and paste it into your browser to view the store.

### Step 10: Troubleshooting

If you encounter any problems, copy the error displayed in the VS Code terminal and paste it into an AI website (like Gemini or ChatGPT) for instant help.

## 📂 Project Directory Structure

- **`djangoAdmin/`**: The Management and Database.

  - **`djangoAdmin/admin.py`**: This is where you want to display all your data here, so that you will monitor, add, delete, and modify in the admin link. It allows you to manage records for Products, Sales, and Debtors directly.
  - **Access**: You can access it at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).
  - **Credentials**: Enter the administrator's username **"lestong"** and the password **"Lester1234#"**.

- **`jorams/`**: The Main Project Configuration.

  - **`jorams/settings.py`**: This is responsible for all and the main core where your website is working and starting. This is where you add APIs, configure your database settings, and manage installed apps.
  - **`jorams/urls.py`**: This is responsible for the URL routing of the entire project. It maps web addresses to the correct functions in your backend, such as the dashboard or the sale processing logic.

- **`server/`**: The Website Application (Frontend & Backend Logic).
  - **`server/static/server/css`**: This is your CSS which defines the visual appearance, including colors, button styles, and the layout for your dashboard and modals.
  - **`server/static/server/js`**: This is your JS and this is where your interactive logic lives, such as the shopping cart functionality (`cart.js`), debt management (`debtors.js`), and dashboard navigation (`dashboard.js`).
  - **`server/templates/server`**: This is your HTML which provides the structural framework for your pages, such as the main dashboard and the login interface.
  - **`server/models.py`**: This is where you must configure your database. It defines the tables for your store, including `Product` categories, `Sale` records, and `Debtor` information.
  - **`server/views.py`**: This is where your backend logic is located. It processes data requests, handles user authentication, updates inventory stock, and calculates sales profits.

## 🗄️ Database Management

When you make changes like adding or fixing things in `server/models.py`, you must update the database so it knows about the new structure.

### How to Apply Database Changes:

**1. Create the Change List (makemigrations)**
Type this command in your terminal:
`python manage.py makemigrations server`

- **What this means:** It tells Django to look at your `models.py` and package your changes into a "migration file" (a set of instructions).
- **It will look like this:**
  ```text
  Migrations for 'server':
    server/migrations/0002_added_new_field.py
      - Add field price to product
  ```

**2. Apply the Instructions (migrate)** Next, type this command: `python manage.py migrate`

- **What this means:** It takes the instructions created in the first step and actually applies them to the database file. This makes your new data fields ready to use.

**3. Run the Server** Type `python manage.py runserver` to see your changes on the website or the Django Admin.

- **Pro Tip:** If the server is already running, press **Ctrl + C** to exit so you can type these commands. Then, type `python manage.py runserver` again to restart.

### ⚠️ Important Notes for Beginners

- **Do I need to type these commands for every file? No.** These commands only work for `server/models.py`.

- **What about other files?** If you change **CSS, JS, HTML (templates), or views.py,** you do **NOT** need these commands. Simply press **Ctrl + S** to save your work, and the website will update automatically.

- **Updating the Django Admin:** Changes in `models.py` will not show up on the Django Admin page automatically. You must also register those new fields in `djangoAdmin/admin.py` to make them visible at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).

### 🆘 How to Reset (If migrations fail)

If you have a problem with your migrations that you cannot fix, follow these steps to reset your database:

**1.** Delete the `db.sqlite3` file in your main project folder.

**2.** Open the `server/migrations` folder and delete all files **EXCEPT** **`__init__.py`**.

**3.** Run the commands again: Type `python manage.py makemigrations server` and then `python manage.py migrate`.

**4.** **Create a Superuser**: Because deleting the database also deletes all accounts, you must type this command to create a new "Boss" account: `python manage.py createsuperuser`

- **Your account info:**
  - **Username**: `lestong`
  - **Email**: `lesteralcantara1432@gmail.com`
  - **Password**: `Lester1234#`

## 🖥️ Working with the Django Admin

The Django Admin is the "Front Desk" of your database. It lets you manage your store's data using a simple website instead of code.

- **Registration Rule**: If you add something new to `server/models.py`, it will not show up in the Admin automatically. You must register it in **`djangoAdmin/admin.py`** first.
- **How to Login**:
  1. Go to [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).
  2. Use your **Superuser** credentials (Username: `lestong` | Password: `Lester1234#`).
- **Main Actions**: Use this page to **Monitor, Add, Delete, or Modify** your Products, Sales, and Debtors directly.
- **Explore**: The rest is for you to explore! The Django Admin has many built-in tools to help you manage your store efficiently.

### ⚠️ IMPORTANT NOTE:

The **Superuser** account is specifically for the **Django Admin** and cannot be used to log in directly to the main website.

**How to allow someone to log in to the website:**

1. Log in to the Django Admin at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).
2. Find the **"Users"** section and click **"Add User"**.
3. Create the new user account there.
4. Once created, that new user can then log in to the actual store website.

## 🚀 GitHub Upload Guide

Follow these steps when you are ready to send your code to the GitHub repository:

### STEP 1: Exit the Virtual Environment

Type: `deactivate`

- **What this does:** It closes the "private room" (Virtual Environment) so you can run global Git commands on your main computer files.

### STEP 2: Initialize Git

Type: `git init`

- **What this does:** This turns your folder into a "Git project" so the computer can start tracking every change you make to the code.

### STEP 3: Prepare Your Files

Type: `git add .`

- **What this does:** This gathers all your files and puts them in a "waiting area" to be saved. The dot `.` means "everything in this folder."

### STEP 4: Link to GitHub

Type: `git remote add origin https://github.com/lestonggg/Sari-Sari-Store-Website.git`

- **What this does:** This creates a bridge between your laptop and the GitHub website so the code knows where to go.

### STEP 5: Check the Connection

Type: `git remote -v`

- **What this does:** This shows you the link you just added to confirm your computer is connected to the right website.
- **Sample Display:**
  ```text
  origin  [https://github.com/lestonggg/Sari-Sari-Store-Website.git](https://github.com/lestonggg/Sari-Sari-Store-Website.git) (fetch)
  origin  [https://github.com/lestonggg/Sari-Sari-Store-Website.git](https://github.com/lestonggg/Sari-Sari-Store-Website.git) (push)
  ```

### STEP 6: Rename the Branch

Type: `git branch -m main`

- **What this does:** This renames your default branch from "master" to "main" to follow the modern naming standard on GitHub.
- **How to check:** Type `git branch`. If you see `* main` in green, it worked!

### STEP 7: Save Your Changes (Commit)

Type: `git commit -m "Describe your changes here"`

- **What this does:** This creates a permanent "save point" or snapshot of your work. You should write a short note about what you fixed or added.

### STEP 8: Upload to GitHub (Push)

Type: `git push -u origin main`

- **What this does:** This officially sends your saved files over the "bridge" to the GitHub website.

## ADDITIONAL:

### 🆘 If "Push" is Rejected:

If you see an error saying "non-fast-forward," it means GitHub has files you don't have.

- **To overwrite everything**: Type `git push -u origin main --force`
- **To merge files**: Type `git pull origin main --rebase` then try pushing again.

### 🔄 How to Restart Git

If your Git history gets messy, you can delete the hidden `.git` folder by typing `Remove-Item -Recurse -Force .git` in the terminal. Then, run `git init` to start fresh.

### 🔄 How to Verify Git Reset

If you want to make sure the Git history is deleted, type `ls -Force`. If `.git` is not in the list, the reset was successful and you can start over with `git init`.
