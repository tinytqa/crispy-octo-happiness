ALTER PROCEDURE sp_UpdateTeacherSubjects
    @TId NVARCHAR(50), 
    @Subjects NVARCHAR(MAX) 
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra nếu giáo viên có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM tblTeacher WHERE t_id = @TId)
    BEGIN
        RAISERROR('Teacher ID does not exist!', 16, 1);
        RETURN;
    END

    -- Xóa tất cả các môn học cũ của giáo viên
    DELETE FROM tblTeacherSubject WHERE tsj_t_id = @TId;

    -- Nếu có danh sách môn học, thêm vào bảng trung gian tblTeacherSubject
    IF @Subjects IS NOT NULL AND @Subjects <> ''
    BEGIN
        INSERT INTO tblTeacherSubject (tsj_id, tsj_t_id, tsj_sj_id)
        SELECT NEWID(), @TId, sj.sj_id
        FROM tblSubject sj
        JOIN (
            SELECT LTRIM(RTRIM(value)) AS subject_name FROM STRING_SPLIT(@Subjects, ',')
        ) AS subject_list
        ON sj.sj_name = subject_list.subject_name;
    END
END;



EXEC sp_UpdateTeacherSubjects 
    @TId = 'T006',
    @Subjects = 'English';
