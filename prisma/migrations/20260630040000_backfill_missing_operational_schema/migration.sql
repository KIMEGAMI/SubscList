SET @trialEndsAtMissing = (
  SELECT COUNT(*) = 0
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Subscription'
    AND COLUMN_NAME = 'trialEndsAt'
);
SET @trialEndsAtSql = IF(
  @trialEndsAtMissing,
  'ALTER TABLE `Subscription` ADD COLUMN `trialEndsAt` DATETIME(3) NULL',
  'SELECT 1'
);
PREPARE trialEndsAtStmt FROM @trialEndsAtSql;
EXECUTE trialEndsAtStmt;
DEALLOCATE PREPARE trialEndsAtStmt;

SET @cancellationDeadlineMissing = (
  SELECT COUNT(*) = 0
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Subscription'
    AND COLUMN_NAME = 'cancellationDeadline'
);
SET @cancellationDeadlineSql = IF(
  @cancellationDeadlineMissing,
  'ALTER TABLE `Subscription` ADD COLUMN `cancellationDeadline` DATETIME(3) NULL',
  'SELECT 1'
);
PREPARE cancellationDeadlineStmt FROM @cancellationDeadlineSql;
EXECUTE cancellationDeadlineStmt;
DEALLOCATE PREPARE cancellationDeadlineStmt;

SET @lastReviewedAtMissing = (
  SELECT COUNT(*) = 0
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Subscription'
    AND COLUMN_NAME = 'lastReviewedAt'
);
SET @lastReviewedAtSql = IF(
  @lastReviewedAtMissing,
  'ALTER TABLE `Subscription` ADD COLUMN `lastReviewedAt` DATETIME(3) NULL',
  'SELECT 1'
);
PREPARE lastReviewedAtStmt FROM @lastReviewedAtSql;
EXECUTE lastReviewedAtStmt;
DEALLOCATE PREPARE lastReviewedAtStmt;

CREATE TABLE IF NOT EXISTS `NotificationDelivery` (
  `id` VARCHAR(191) NOT NULL,
  `subscriptionId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `scheduledFor` DATETIME(3) NOT NULL,
  `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `NotificationDelivery_subscriptionId_type_scheduledFor_key`(`subscriptionId`, `type`, `scheduledFor`),
  INDEX `NotificationDelivery_userId_sentAt_idx`(`userId`, `sentAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @subscriptionDeliveryFkMissing = (
  SELECT COUNT(*) = 0
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NotificationDelivery'
    AND CONSTRAINT_NAME = 'NotificationDelivery_subscriptionId_fkey'
);
SET @subscriptionDeliveryFkSql = IF(
  @subscriptionDeliveryFkMissing,
  'ALTER TABLE `NotificationDelivery` ADD CONSTRAINT `NotificationDelivery_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE subscriptionDeliveryFkStmt FROM @subscriptionDeliveryFkSql;
EXECUTE subscriptionDeliveryFkStmt;
DEALLOCATE PREPARE subscriptionDeliveryFkStmt;

SET @userDeliveryFkMissing = (
  SELECT COUNT(*) = 0
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NotificationDelivery'
    AND CONSTRAINT_NAME = 'NotificationDelivery_userId_fkey'
);
SET @userDeliveryFkSql = IF(
  @userDeliveryFkMissing,
  'ALTER TABLE `NotificationDelivery` ADD CONSTRAINT `NotificationDelivery_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE userDeliveryFkStmt FROM @userDeliveryFkSql;
EXECUTE userDeliveryFkStmt;
DEALLOCATE PREPARE userDeliveryFkStmt;
