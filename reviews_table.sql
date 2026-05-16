-- ══════════════════════════════════════════════════
-- URGMS — Run this AFTER importing urgms.sql
-- ══════════════════════════════════════════════════

-- Reviews table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `upload_id`       int(11)      NOT NULL,
  `reviewer_id`     varchar(10)  NOT NULL,
  `status`          varchar(20)  NOT NULL DEFAULT 'Pending',
  `decision`        varchar(20)  DEFAULT NULL,
  `mark_quality`    int(3)       DEFAULT 0,
  `mark_method`     int(3)       DEFAULT 0,
  `mark_lit`        int(3)       DEFAULT 0,
  `mark_pres`       int(3)       DEFAULT 0,
  `total_score`     int(3)       DEFAULT 0,
  `comment`         text         DEFAULT NULL,
  `evaluation_date` date         DEFAULT NULL,
  `reviewed_at`     timestamp    NULL DEFAULT NULL,
  `created_at`      timestamp    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `upload_id` (`upload_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`upload_id`)  REFERENCES `uploads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users`   (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add profile_pic and mobile to users (safe if already exists)
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `profile_pic` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `mobile`      varchar(20)  DEFAULT NULL;