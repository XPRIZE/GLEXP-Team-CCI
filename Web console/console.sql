-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 17, 2017 at 04:55 PM
-- Server version: 5.5.50-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `console`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE IF NOT EXISTS `books` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `longname` varchar(255) NOT NULL,
  `pages` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=39 ;

-- --------------------------------------------------------

--
-- Table structure for table `childassetnotes`
--

CREATE TABLE IF NOT EXISTS `childassetnotes` (
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

CREATE TABLE IF NOT EXISTS `children` (
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

CREATE TABLE IF NOT EXISTS `levels` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `schoolID` int(11) NOT NULL,
  `subjectID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=66 ;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE IF NOT EXISTS `schools` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=30 ;

-- --------------------------------------------------------

--
-- Table structure for table `series`
--

CREATE TABLE IF NOT EXISTS `series` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `version` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=319 ;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE IF NOT EXISTS `subjects` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `schoolID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=34 ;

-- --------------------------------------------------------

--
-- Table structure for table `swaps`
--

CREATE TABLE IF NOT EXISTS `swaps` (
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
-- Table structure for table `unitPages`
--

CREATE TABLE IF NOT EXISTS `unitPages` (
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

CREATE TABLE IF NOT EXISTS `units` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `outdated` tinyint(1) NOT NULL DEFAULT '0',
  `order` int(11) NOT NULL,
  `schoolID` int(11) NOT NULL,
  `subjectID` int(11) DEFAULT NULL,
  `levelID` int(11) DEFAULT NULL,
  `isGame` tinyint(4) NOT NULL DEFAULT '0',
  `isTutorial` tinyint(4) NOT NULL DEFAULT '0',
  `tutorialType` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=422 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(255) NOT NULL,
  `password` varchar(128) NOT NULL,
  `hash` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `passHint` varchar(255) NOT NULL,
  `accepted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
