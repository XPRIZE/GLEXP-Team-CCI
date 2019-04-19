-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 08, 2019 at 03:34 PM
-- Server version: 5.7.25-0ubuntu0.18.04.2
-- PHP Version: 7.2.15-0ubuntu0.18.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pubbly_console`
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
  `folder` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`ID`, `name`, `longname`, `pages`, `priority`, `folder`) VALUES
(8, 'map home', 'map home', 1, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `childAssetNotes`
--

CREATE TABLE `childAssetNotes` (
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

--
-- Dumping data for table `children`
--

INSERT INTO `children` (`child_id`, `seriesName`, `childName`, `deleted`, `childID`, `locked`, `status`) VALUES
(4, 'map nodes', 'n1', 0, 1, 0, 'progress'),
(5, 'map node', 'ndoe1', 0, 1, 0, 'progress'),
(6, 'map node', 'node2', 0, 2, 0, 'progress');

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

--
-- Dumping data for table `levels`
--

INSERT INTO `levels` (`ID`, `name`, `schoolID`, `subjectID`) VALUES
(1, 'sdfg', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `map`
--

CREATE TABLE `map` (
  `map_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `map`
--

INSERT INTO `map` (`map_id`, `name`) VALUES
(2, 'test map'),
(3, 'test map 2');

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
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `map_node`
--

INSERT INTO `map_node` (`map_node_id`, `map_id`, `name`, `has_cover`, `is_entry`, `child_id`, `book_id`, `unit_id`, `x`, `y`) VALUES
(2, 2, 'static-map home', 1, 1, NULL, 8, NULL, 1520, 400),
(3, 2, 'variable-map node-ndoe1', 1, 0, 5, NULL, NULL, 1240, 720),
(4, 2, 'variable-map node-node2', 1, 0, 6, NULL, NULL, 1840, 720),
(5, 3, 'variable-map node-ndoe1', 1, 0, 5, NULL, NULL, 760, 200);

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

--
-- Dumping data for table `map_node_path`
--

INSERT INTO `map_node_path` (`map_node_path_id`, `from_node_id`, `from_link_name`, `from_link_page`, `to_node_id`) VALUES
(1, 2, 'mt_node1', 0, 3),
(2, 2, 'mt_node2', 0, 4),
(3, 3, 'Link 1', 0, 2),
(4, 4, 'Link 1', 0, 2),
(5, 5, 'Link 1', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `outdated` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`ID`, `name`, `outdated`) VALUES
(1, 'sdfg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `series`
--

CREATE TABLE `series` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `version` int(11) NOT NULL DEFAULT '1',
  `folder` varchar(255) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `series`
--

INSERT INTO `series` (`ID`, `name`, `deleted`, `version`, `folder`, `priority`) VALUES
(9, 'map node', 0, 1, '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `ID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `schoolID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`ID`, `name`, `schoolID`) VALUES
(1, 'sfdg', 1);

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

--
-- Dumping data for table `swaps`
--

INSERT INTO `swaps` (`refSeries`, `refBook`, `originalAssetName`, `newAssetName`, `sizeOrLoc`, `swapTimestamp`, `username`, `deleted`, `fileModified`) VALUES
('map node', 'node2', 'Field 1', 'Tm9kZSAy', 'size', '2019-04-05 18:01:35', 'Jason', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `unitPages`
--

CREATE TABLE `unitPages` (
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

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`ID`, `name`, `outdated`, `order`, `schoolID`, `subjectID`, `levelID`, `isGame`, `isTutorial`, `tutorialType`) VALUES
(1, 'sdfg', 0, 1, 1, 1, 1, 0, 0, NULL);

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
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `email`, `hint`) VALUES
(1, 'jason', '$2y$10$DEk1AeOhPSt.ftlXfKREaO1yi7SA.TsnDHHlvwHQHvqpgfhTpgt.m', 'Jason@JasonHorsley.tech', 'HR');

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
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `children`
--
ALTER TABLE `children`
  MODIFY `child_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `levels`
--
ALTER TABLE `levels`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `map`
--
ALTER TABLE `map`
  MODIFY `map_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `map_node`
--
ALTER TABLE `map_node`
  MODIFY `map_node_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `map_node_path`
--
ALTER TABLE `map_node_path`
  MODIFY `map_node_path_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `series`
--
ALTER TABLE `series`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
