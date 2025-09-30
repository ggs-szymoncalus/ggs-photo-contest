IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
	CREATE TABLE users(
		id int IDENTITY(1,1) PRIMARY KEY,
		email NVARCHAR(100) UNIQUE NOT NULL,
		first_name NVARCHAR(50) NOT NULL,
		last_name NVARCHAR(50) NOT NULL,
		icon NVARCHAR(MAX),
		role NVARCHAR(10) NOT NULL,
		created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
		updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,

		CHECK (email LIKE '%@%.%')
	)
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
	CREATE TABLE categories(
		id int IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(30) UNIQUE NOT NULL
	)
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='submissions' AND xtype='U')
	CREATE TABLE submissions(
		id int IDENTITY(1,1) PRIMARY KEY,
		category_id int NOT NULL FOREIGN KEY REFERENCES categories(id),
		user_id int NOT NULL FOREIGN KEY REFERENCES users(id),
		image_link NVARCHAR(MAX) NOT NULL,
		title NVARCHAR(100) NOT NULL,
		description NVARCHAR(1000),
		location NVARCHAR(100),
		isWinner BIT NOT NULL DEFAULT 0,
		created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
	)
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='votes' AND xtype='U')
	CREATE TABLE votes(
		submission_id int NOT NULL FOREIGN KEY REFERENCES submissions(id) ON DELETE CASCADE,
		user_id int NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
		updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
		created_at DATETIME2 DEFAULT GETDATE() NOT NULL,

		PRIMARY KEY(submission_id, user_id)
	)
GO
