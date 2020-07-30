USE CDMS_Test
GO


--DELETE FROM TestDatastore_Detail
--DELETE FROM TestDatastore_Header
DELETE FROM Activities

DECLARE @DatasetId INT = (SELECT MAX(Id) FROM Datasets WHERE NAME = 'TestProject-TestDatastore')
DELETE FROM DatasetFields WHERE DatasetId = @DatasetId
DELETE FROM Datasets WHERE Id = @DatasetId

DECLARE @LocationTypeId INT = (SELECT MAX(Id) FROM LocationTypes WHERE Name = 'TestDatastore')
DELETE FROM Locations WHERE LocationTypeId = @LocationTypeId AND Label = 'TestLocation'
DELETE FROM LocationTypes WHERE NAME LIKE '%Test%' AND Id = @LocationTypeId 

DELETE FROM Projects WHERE Name = 'TestProject'

DECLARE @DatastoreId INT = (SELECT MAX(Id) FROM Datastores WHERE Name = 'TestDatastore')
DELETE FROM Fields WHERE DatastoreId = @DatastoreId
DELETE FROM Datastores WHERE Name = 'TestDatastore' AND Id = @DatastoreId

DBCC CHECKIDENT ('[Datastores]', RESEED, 32);
DBCC CHECKIDENT ('[Datasets]', RESEED, 32);
DBCC CHECKIDENT ('[LocationTypes]', RESEED, 46);


DROP VIEW IF EXISTS TestDatastore_VW
DROP VIEW IF EXISTS TestDatastore_Detail_VW
DROP VIEW IF EXISTS TestDatastore_Header_VW
DROP TABLE IF EXISTS TestDatastore_Detail
DROP TABLE IF EXISTS TestDatastore_Header

DROP VIEW IF EXISTS Test_VW
DROP VIEW IF EXISTS Test_Detail_VW
DROP VIEW IF EXISTS Test_Header_VW
DROP TABLE IF EXISTS Test_Detail
DROP TABLE IF EXISTS Test_Header



