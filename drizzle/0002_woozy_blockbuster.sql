CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`tax` int DEFAULT 0,
	`totalAmount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'INR',
	`status` enum('draft','issued','paid','overdue','cancelled') DEFAULT 'issued',
	`issueDate` timestamp DEFAULT (now()),
	`dueDate` timestamp,
	`paidDate` timestamp,
	`pdfUrl` varchar(512),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`orderType` enum('membership','product','service') NOT NULL,
	`division` enum('ave','sakshi','subcircle') NOT NULL,
	`itemId` int,
	`itemName` varchar(255) NOT NULL,
	`quantity` int DEFAULT 1,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'INR',
	`status` enum('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
	`paymentMethod` enum('stripe','razorpay','bank','upi'),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `paymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`methodType` enum('stripe','razorpay','bank','upi') NOT NULL,
	`isDefault` boolean DEFAULT false,
	`lastFourDigits` varchar(4),
	`expiryMonth` int,
	`expiryYear` int,
	`bankName` varchar(255),
	`accountHolder` varchar(255),
	`upiId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'INR',
	`paymentGateway` enum('stripe','razorpay','manual') NOT NULL,
	`gatewayTransactionId` varchar(255),
	`status` enum('initiated','processing','success','failed','refunded') DEFAULT 'initiated',
	`paymentMethod` varchar(50),
	`errorMessage` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_gatewayTransactionId_unique` UNIQUE(`gatewayTransactionId`)
);
