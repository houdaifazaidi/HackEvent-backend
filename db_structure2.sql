-- ======================================================
-- EVENT PLATFORM DATABASE SCHEMA
-- ======================================================

-- ======================================================
-- ADMINS
-- ======================================================

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- EVENTS
-- ======================================================

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo VARCHAR(255),
    event_date DATETIME,
    status ENUM('waiting','current','finished') DEFAULT 'waiting',
    max_leaders INT NOT NULL,
    max_team_members INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- WORKSHOPS
-- ======================================================

CREATE TABLE IF NOT EXISTS workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    technology VARCHAR(100),
    duration INT,
    event_id INT NOT NULL,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- MEMBERS
-- ======================================================

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    portfolio VARCHAR(255),
    role ENUM('leader','member') DEFAULT 'member',
    event_id INT NOT NULL,
    team_id INT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- TEAMS
-- ======================================================

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    color VARCHAR(20),
    practical_score INT DEFAULT 0,
    theoretical_score INT DEFAULT 0,
    event_id INT NOT NULL,
    leader_id INT NOT NULL,

    -- TEAM NAME UNIQUE INSIDE EVENT
    UNIQUE(name, event_id),

    -- A LEADER CAN ONLY LEAD ONE TEAM
    UNIQUE(leader_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    FOREIGN KEY (leader_id)
        REFERENCES members(id)
        ON DELETE CASCADE
);

-- ======================================================
-- MEMBER TEAM RELATION (Adding Constraint)
-- ======================================================

ALTER TABLE members
ADD CONSTRAINT fk_member_team
FOREIGN KEY (team_id)
REFERENCES teams(id)
ON DELETE SET NULL;

-- ======================================================
-- LEADER INVITATIONS
-- ======================================================

CREATE TABLE IF NOT EXISTS leader_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    event_id INT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- TEAM INVITATIONS
-- ======================================================

CREATE TABLE IF NOT EXISTS team_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    team_id INT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE
);

-- ======================================================
-- EVENT TIMER
-- ======================================================

CREATE TABLE IF NOT EXISTS timers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    status ENUM('not_started','running','paused','finished') DEFAULT 'not_started',

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- SESSIONS
-- ======================================================

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ======================================================
-- TRIGGERS
-- ======================================================

DELIMITER $$

-- 1. Handle Team Deletion
CREATE TRIGGER before_team_delete
BEFORE DELETE ON teams
FOR EACH ROW
BEGIN
    -- Delete regular members
    DELETE FROM members
    WHERE team_id = OLD.id
    AND role = 'member';

    -- Keep leaders but remove team reference
    UPDATE members
    SET team_id = NULL
    WHERE team_id = OLD.id
    AND role = 'leader';
END$$

-- 2. Enforce only one "current" event (On Insert)
CREATE TRIGGER limit_current_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.status = 'current' THEN
        IF (SELECT COUNT(*) FROM events WHERE status = 'current') > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Only one event can be current at a time';
        END IF;
    END IF;
END$$

-- 3. Enforce only one "current" event (On Update)
CREATE TRIGGER limit_current_event_update
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
    IF NEW.status = 'current' AND OLD.status <> 'current' THEN
        IF (SELECT COUNT(*) FROM events WHERE status = 'current') > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Only one event can be current at a time';
        END IF;
    END IF;
END$$

DELIMITER ;
