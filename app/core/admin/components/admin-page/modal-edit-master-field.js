//modal to edit master field
var modal_admin_edit_master_field = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.field_to_edit.DatastoreId = $scope.datastore.Id;
		
		$scope.save = function () {

            if($scope.field_to_edit.DbColumnName == undefined || $scope.field_to_edit.Name == undefined){
                alert("Error: Name and DbColumnName are required fields.");
                return;
            }

			var saved_field = AdminService.saveMasterField($scope.field_to_edit);

			//Tribal CDMS Edit - check DbColumnName for SQL keywords
			var dbcolumnname = $scope.field_to_edit.DbColumnName.toUpperCase();
	
			if (sql_keywords.includes(dbcolumnname)) {
				
				alert("Db Column Name " + dbcolumnname + " is an SQL keyword. "
					+ "Please alter this value slightly (e.g., Prefix_" + dbcolumnname + ") or use a different column name.");
			}
			else {
		
				saved_field.$promise.then(function () { 
					$modalInstance.close(saved_field);
				}, function (error) {
					$scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
				});
			};

			$scope.cleanDbColumnName = function(){
				$scope.field_to_edit.DbColumnName = $scope.field_to_edit.DbColumnName.replace(/\s/g, '');
			}

			$scope.parsePossibleValuesString = function () { 
				try {
					$scope.field_to_edit.Values = angular.fromJson($scope.field_to_edit.PossibleValues);
				} catch (exception) {
					$scope.field_to_edit.Values = exception.message;
				}
			}

			$scope.cancel = function () {
				$modalInstance.dismiss();
			};

			$scope.parsePossibleValuesString();        
		}
		
		var sql_keywords = ["ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "AUTHORIZATION", "BACKUP", "BEGIN"
			, "BETWEEN", "BREAK", "BROWSE", "BULK", "BY", "CASCADE", "CASE", "CHECKPOINT", "CLOSE", "CLUSTERED", "COALESCE"
			,"COLLATE", "COLUMN", "COMMIT", "COMPUTE", "CONTAINS", "CONTAINSTABLE", "CONTINUE", "CONVERT", "CREATE", "CROSS"
			,"CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DBCC", "DEALLOCATE"
			,"DECLARE", "DELETE", "DENY", "DESC", "DISTINCT", "DISTRIBUTED", "DOUBLE", "DROP", "ELSE", "END", "END-EXEC", "ERRLVL"
			,"ESCAPE", "EXCEPT", "EXEC", "EXECUTE", "EXISTS", "EXIT", "EXTERNAL", "FETCH", "FILE", "FILLFACTOR", "FOR", "FOREIGN"
			,"FREETEXT", "FREETEXTTABLE", "FROM", "FULL", "FUNCTION", "GO", "GOTO", "GRANT", "GROUP", "HAVING", "HOLDLOCK", "IDENTITY"
			,"IDENTITY_INSERT", "IDENTITYCOL", "IF", "IN", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JOIN", "KEY", "KILL", "LEFT"
			,"LIKE", "LINENO", "NATIONAL", "NOCHECK", "NONCLUSTERED", "NOT", "NULL", "NULLIF", "OF", "OFF", "OFFSETS", "ON", "OPEN"
			,"OPENDATASOURCE", "OPENQUERY", "OPENROWSET", "OPENXML", "OPTION", "ORDER", "OUTER", "OVER", "PERCENT", "PLAN"
			,"PRINT", "PROC", "PROCEDURE", "PUBLIC", "RAISERROR", "READ", "READTEXT", "RECONFIGURE", "REPLICATION", "RESTORE"
			, "RESTRICT", "RETURN", "REVOKE", "RIGHT", "ROLLBACK", "ROWCOUNT", "ROWGUIDCOL", "RULE", "SAVE", "SCHEMA", "SELECT"
			, "SESSION_USER", "SET", "SETUSER", "SHUTDOWN", "SOME", "STATISTICS", "SYSTEM_USER", "TABLE", "TEXTSIZE", "THEN", "TO"
			, "TOP", "TRAN", "TRANSACTION", "TRIGGER", "TRUNCATE", "TSEQUAL", "UNION", "UPDATE", "UPDATETEXT", "USE", "USER", "VALUES"
			, "VARYING", "VIEW", "WAITFOR", "WHEN"];

    }

];
