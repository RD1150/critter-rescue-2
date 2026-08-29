CREATE TABLE IF NOT EXISTS beta_feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kind ENUM('bug', 'suggestion') NOT NULL,
  message VARCHAR(1200) NOT NULL,
  context VARCHAR(120) NOT NULL DEFAULT 'Parent beta feedback',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX beta_feedback_created_at_idx (created_at)
);
