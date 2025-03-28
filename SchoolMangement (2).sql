

DROP TABLE IF EXISTS tblAdmin;

CREATE TABLE tblAdmin (
    a_id NVARCHAR(50) PRIMARY KEY,
    a_email NVARCHAR(255) NOT NULL,
    a_name NVARCHAR(255) NOT NULL,
    a_password NVARCHAR(255) NOT NULL
);
INSERT INTO tblAdmin (a_id, a_email, a_name, a_password)  
VALUES  
    ('A001', 'admin@gmail.com', 'Nguyễn Văn A', 'password123') 

CREATE TABLE tblTeacher (
    t_id NVARCHAR(50) PRIMARY KEY,
	t_password NVARCHAR(255) NOT NULL,
    t_name NVARCHAR(255) NOT NULL,
    t_phone NVARCHAR(255) NOT NULL
);


CREATE TABLE tblClass (
    c_id NVARCHAR(50) PRIMARY KEY,
    c_name NVARCHAR(255) NOT NULL,
	c_t_id NVARCHAR(50) UNIQUE FOREIGN KEY REFERENCES tblTeacher(t_id)
);

CREATE TABLE tblParent (
    p_id NVARCHAR(50) PRIMARY KEY,
	p_password NVARCHAR(255) NOT NULL,
    p_name NVARCHAR(255) NOT NULL,
    p_phone NVARCHAR(255) NOT NULL
);

Create TABLE tblStudent (
    stu_id NVARCHAR(50) PRIMARY KEY,
    stu_name NVARCHAR(255) NOT NULL,
    stu_grade_level INT NOT NULL,
    stu_dob NVARCHAR(255) NOT NULL,
	stu_c_id NVARCHAR(50) FOREIGN KEY REFERENCES tblClass(c_id),
	stu_p_id NVARCHAR(50) FOREIGN KEY REFERENCES tblParent(p_id)
);

CREATE TABLE tblSubject (
    sj_id NVARCHAR(50) PRIMARY KEY,
    sj_name NVARCHAR(255) NOT NULL
);


CREATE TABLE tblTeacherSubject (
    tsj_id uniqueidentifier PRIMARY KEY,
    tsj_t_id NVARCHAR(50) FOREIGN KEY REFERENCES tblTeacher(t_id),
    tsj_sj_id NVARCHAR(50) FOREIGN KEY REFERENCES tblSubject(sj_id)
);

CREATE TABLE tblTeacherSubjectClass(
	tsc_id uniqueidentifier PRIMARY KEY,
	tsc_tsj_id uniqueidentifier FOREIGN KEY REFERENCES tblTeacherSubject(tsj_id),
	tsc_c_id NVARCHAR(50) FOREIGN KEY REFERENCES tblClass(c_id)
);

CREATE TABLE tblGradeComponent (
	gc_id NVARCHAR(50) PRIMARY KEY,
    gc_sj_id NVARCHAR(50) FOREIGN KEY REFERENCES tblSubject(sj_id),
    gc_name NVARCHAR(255) NOT NULL,
    gc_weight FLOAT NOT NULL
);

CREATE TABLE tblStudentGrade(
	stug_id uniqueidentifier PRIMARY KEY,
	stug_grade FLOAT NOT NULL,
	stug_stu_id NVARCHAR(50) FOREIGN KEY REFERENCES tblStudent(stu_id) NOT NULL,
	stug_gc_id NVARCHAR(50) FOREIGN KEY REFERENCES tblGradeComponent(gc_id) NOT NULL
);

ALTER TABLE tblClass 
DROP CONSTRAINT FK__tblClass__c_t_id__40C49C62;

ALTER TABLE tblClass 
ADD CONSTRAINT FK_tblClass_tblTeacher 
FOREIGN KEY (c_t_id) REFERENCES tblTeacher(t_id) ON DELETE SET NULL; -- xóa teacher --> set null cho class


--Xóa một TeacherSubject khi có dữ liệu trong tblTeacherSubjectClass
ALTER TABLE tblTeacherSubjectClass 
DROP CONSTRAINT FK__tblTeache__tsc_t__4F12BBB9;

ALTER TABLE tblTeacherSubjectClass 
ADD CONSTRAINT FK_tblTeacherSubjectClass_tblTeacherSubject 
FOREIGN KEY (tsc_tsj_id) REFERENCES tblTeacherSubject(tsj_id) ON DELETE CASCADE;
-------

--- Xóa một Class khi nó có dữ liệu trong tblTeacherSubjectClass
ALTER TABLE tblTeacherSubjectClass 
DROP CONSTRAINT FK__tblTeache__tsc_c__5006DFF2;

ALTER TABLE tblTeacherSubjectClass 
ADD CONSTRAINT FK_tblTeacherSubjectClass_tblClass 
FOREIGN KEY (tsc_c_id) REFERENCES tblClass(c_id) ON DELETE CASCADE;
------- 


-- xóa teacher --> xóa luôn trong teacher subject
ALTER TABLE tblTeacherSubject 
DROP CONSTRAINT FK__tblTeache__tsj_t__4B422AD5;

ALTER TABLE tblTeacherSubject 
ADD CONSTRAINT FK_tblTeacherSubject_tblTeacher 
FOREIGN KEY (tsj_t_id) REFERENCES tblTeacher(t_id) ON DELETE CASCADE;
---------------------
-- xóa teacher --> gvcn thành null
ALTER TABLE tblClass DROP CONSTRAINT FK_tblClass_tblTeacher;
ALTER TABLE tblClass 
ADD CONSTRAINT FK_tblClass_tblTeacher 
FOREIGN KEY (c_t_id) REFERENCES tblTeacher(t_id) ON DELETE SET NULL;
-------------------
ALTER TABLE tblClass DROP CONSTRAINT FK_tblClass_tblTeacher;

ALTER TABLE tblClass 
ADD CONSTRAINT FK_tblClass_tblTeacher 
FOREIGN KEY (c_t_id) REFERENCES tblTeacher(t_id) ON DELETE SET NULL;
-----------------
SELECT name 
FROM sys.key_constraints 
WHERE parent_object_id = OBJECT_ID('tblClass') AND type = 'UQ';
-- bỏ ràng buộc UNIQUE trên c_t_id của tblClass --> cho phép teacherId là null trong tblclass
ALTER TABLE tblClass DROP CONSTRAINT UQ__tblClass__9AAC62C1507F3497;
----------------





