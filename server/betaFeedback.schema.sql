CREATE TABLE IF NOT EXISTS beta_feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kind ENUM('bug', 'suggestion', 'support') NOT NULL,
  email VARCHAR(254) NULL,
  message VARCHAR(1200) NOT NULL,
  context VARCHAR(120) NOT NULL DEFAULT 'Parent contact form',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX beta_feedback_created_at_idx (created_at)
);
