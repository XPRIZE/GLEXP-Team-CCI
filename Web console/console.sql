-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2018 at 06:19 PM
-- Server version: 10.1.33-MariaDB
-- PHP Version: 7.2.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `console`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `longname` varchar(255) NOT NULL,
  `pages` int(11) NOT NULL DEFAULT '1',
  `priority` int(11) DEFAULT '0',
  `folder` varchar(255) NOT NULL DEFAULT 'General Unsorted'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `childassetnotes`
--

CREATE TABLE `childassetnotes` (
  `refSeries` varchar(255) NOT NULL,
  `refBook` varchar(255) NOT NULL,
  `refPage` int(11) NOT NULL,
  `noteType` varchar(255) NOT NULL COMMENT 'placeholder or note',
  `originalAssetName` varchar(255) NOT NULL,
  `noteAct` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `children`
--

CREATE TABLE `children` (
  `child_id` int(11) NOT NULL,
  `seriesName` varchar(255) NOT NULL,
  `childName` varchar(255) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `childID` int(11) NOT NULL DEFAULT '1',
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(255) NOT NULL DEFAULT 'progress'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `levels`
--

CREATE TABLE `levels` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `schoolID` int(11) NOT NULL,
  `subjectID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `map`
--

CREATE TABLE `map` (
  `map_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `map_node`
--

CREATE TABLE `map_node` (
  `map_node_id` int(11) NOT NULL,
  `map_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `has_cover` tinyint(1) NOT NULL DEFAULT '0',
  `is_entry` tinyint(1) NOT NULL DEFAULT '0',
  `child_id` int(11) DEFAULT NULL,
  `book_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `map_node_path`
--

CREATE TABLE `map_node_path` (
  `map_node_path_id` int(11) NOT NULL,
  `from_node_id` int(11) NOT NULL,
  `from_link_name` varchar(128) NOT NULL,
  `from_link_page` int(11) NOT NULL,
  `to_node_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `outdated` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `series`
--

CREATE TABLE `series` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `version` int(11) NOT NULL DEFAULT '1',
  `folder` varchar(255) NOT NULL DEFAULT 'general unsorted',
  `priority` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `schoolID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `swaps`
--

CREATE TABLE `swaps` (
  `refSeries` varchar(255) NOT NULL,
  `refBook` varchar(255) NOT NULL COMMENT 'Something like S_1_C_3, using series ID and child ID',
  `originalAssetName` varchar(255) NOT NULL COMMENT 'Apple.png',
  `newAssetName` varchar(255) NOT NULL COMMENT 'Banana.png',
  `sizeOrLoc` varchar(255) NOT NULL DEFAULT 'size',
  `swapTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When swap was made (if ever)',
  `username` varchar(255) NOT NULL COMMENT 'Who made the swap',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `fileModified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `unitpages`
--

CREATE TABLE `unitpages` (
  `unitID` int(11) NOT NULL,
  `unitPage` int(11) NOT NULL,
  `refPage` int(11) NOT NULL,
  `refSeries` varchar(255) DEFAULT NULL,
  `refChild` varchar(255) DEFAULT NULL,
  `refBook` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `outdated` tinyint(1) NOT NULL DEFAULT '0',
  `order` int(11) NOT NULL,
  `schoolID` int(11) NOT NULL,
  `subjectID` int(11) DEFAULT NULL,
  `levelID` int(11) DEFAULT NULL,
  `isGame` tinyint(4) NOT NULL DEFAULT '0',
  `isTutorial` tinyint(4) NOT NULL DEFAULT '0',
  `tutorialType` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hint` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `children`
--
ALTER TABLE `children`
  ADD PRIMARY KEY (`child_id`);

--
-- Indexes for table `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `map`
--
ALTER TABLE `map`
  ADD PRIMARY KEY (`map_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `map_node`
--
ALTER TABLE `map_node`
  ADD PRIMARY KEY (`map_node_id`),
  ADD UNIQUE KEY `map_id` (`map_id`,`name`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `child_id` (`child_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `map_node_path`
--
ALTER TABLE `map_node_path`
  ADD PRIMARY KEY (`map_node_path_id`),
  ADD UNIQUE KEY `no_duplicate_map_node_xml_links` (`from_node_id`,`from_link_name`,`from_link_page`) USING BTREE,
  ADD KEY `from_node_id` (`from_node_id`),
  ADD KEY `map_node_path_ibfk_2` (`to_node_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `children`
--
ALTER TABLE `children`
  MODIFY `child_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `levels`
--
ALTER TABLE `levels`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `map`
--
ALTER TABLE `map`
  MODIFY `map_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `map_node`
--
ALTER TABLE `map_node`
  MODIFY `map_node_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `map_node_path`
--
ALTER TABLE `map_node_path`
  MODIFY `map_node_path_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `series`
--
ALTER TABLE `series`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `map_node`
--
ALTER TABLE `map_node`
  ADD CONSTRAINT `map_node_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `map_node_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `children` (`child_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `map_node_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `map_node_ibfk_4` FOREIGN KEY (`map_id`) REFERENCES `map` (`map_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `map_node_path`
--
ALTER TABLE `map_node_path`
  ADD CONSTRAINT `map_node_path_ibfk_1` FOREIGN KEY (`from_node_id`) REFERENCES `map_node` (`map_node_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `map_node_path_ibfk_2` FOREIGN KEY (`to_node_id`) REFERENCES `map_node` (`map_node_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
