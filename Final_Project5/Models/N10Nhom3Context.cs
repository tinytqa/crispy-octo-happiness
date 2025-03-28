using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Models;

public partial class N10Nhom3Context : DbContext
{
    public N10Nhom3Context()
    {
    }

    public N10Nhom3Context(DbContextOptions<N10Nhom3Context> options)
        : base(options)
    {
    }

    public virtual DbSet<TblAdmin> TblAdmins { get; set; }

    public virtual DbSet<TblClass> TblClasses { get; set; }

    public virtual DbSet<TblGradeComponent> TblGradeComponents { get; set; }

    public virtual DbSet<TblParent> TblParents { get; set; }

    public virtual DbSet<TblStudent> TblStudents { get; set; }

    public virtual DbSet<TblStudentGrade> TblStudentGrades { get; set; }

    public virtual DbSet<TblSubject> TblSubjects { get; set; }

    public virtual DbSet<TblTeacher> TblTeachers { get; set; }

    public virtual DbSet<TblTeacherSubject> TblTeacherSubjects { get; set; }

    public virtual DbSet<TblTeacherSubjectClass> TblTeacherSubjectClasses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=cnn");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TblAdmin>(entity =>
        {
            entity.HasKey(e => e.AId).HasName("PK__tblAdmin__566AFA9A58A6A3DF");

            entity.ToTable("tblAdmin");

            entity.Property(e => e.AId)
                .HasMaxLength(50)
                .HasColumnName("a_id");
            entity.Property(e => e.AEmail)
                .HasMaxLength(255)
                .HasColumnName("a_email");
            entity.Property(e => e.AName)
                .HasMaxLength(255)
                .HasColumnName("a_name");
            entity.Property(e => e.APassword)
                .HasMaxLength(255)
                .HasColumnName("a_password");
        });

        modelBuilder.Entity<TblClass>(entity =>
        {
            entity.HasKey(e => e.CId).HasName("PK__tblClass__213EE77469EA3AB3");

            entity.ToTable("tblClass");

            entity.Property(e => e.CId)
                .HasMaxLength(50)
                .HasColumnName("c_id");
            entity.Property(e => e.CName)
                .HasMaxLength(255)
                .HasColumnName("c_name");
            entity.Property(e => e.CTId)
                .HasMaxLength(50)
                .HasColumnName("c_t_id");

            entity.HasOne(d => d.CT).WithMany(p => p.TblClasses)
                .HasForeignKey(d => d.CTId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_tblClass_tblTeacher");
        });

        modelBuilder.Entity<TblGradeComponent>(entity =>
        {
            entity.HasKey(e => e.GcId).HasName("PK__tblGrade__9D4625E9190808FD");

            entity.ToTable("tblGradeComponent");

            entity.Property(e => e.GcId)
                .HasMaxLength(50)
                .HasColumnName("gc_id");
            entity.Property(e => e.GcName)
                .HasMaxLength(255)
                .HasColumnName("gc_name");
            entity.Property(e => e.GcSjId)
                .HasMaxLength(50)
                .HasColumnName("gc_sj_id");
            entity.Property(e => e.GcWeight).HasColumnName("gc_weight");

            entity.HasOne(d => d.GcSj).WithMany(p => p.TblGradeComponents)
                .HasForeignKey(d => d.GcSjId)
                .HasConstraintName("FK__tblGradeC__gc_sj__52E34C9D");
        });

        modelBuilder.Entity<TblParent>(entity =>
        {
            entity.HasKey(e => e.PId).HasName("PK__tblParen__82E06B9161896218");

            entity.ToTable("tblParent");

            entity.Property(e => e.PId)
                .HasMaxLength(50)
                .HasColumnName("p_id");
            entity.Property(e => e.PName)
                .HasMaxLength(255)
                .HasColumnName("p_name");
            entity.Property(e => e.PPassword)
                .HasMaxLength(255)
                .HasColumnName("p_password");
            entity.Property(e => e.PPhone)
                .HasMaxLength(255)
                .HasColumnName("p_phone");
        });

        modelBuilder.Entity<TblStudent>(entity =>
        {
            entity.HasKey(e => e.StuId).HasName("PK__tblStude__E53CAB217B0991BA");

            entity.ToTable("tblStudent");

            entity.Property(e => e.StuId)
                .HasMaxLength(50)
                .HasColumnName("stu_id");
            entity.Property(e => e.StuCId)
                .HasMaxLength(50)
                .HasColumnName("stu_c_id");
            entity.Property(e => e.StuDob)
                .HasMaxLength(255)
                .HasColumnName("stu_dob");
            entity.Property(e => e.StuGradeLevel).HasColumnName("stu_grade_level");
            entity.Property(e => e.StuName)
                .HasMaxLength(255)
                .HasColumnName("stu_name");
            entity.Property(e => e.StuPId)
                .HasMaxLength(50)
                .HasColumnName("stu_p_id");

            entity.HasOne(d => d.StuC).WithMany(p => p.TblStudents)
                .HasForeignKey(d => d.StuCId)
                .HasConstraintName("FK__tblStuden__stu_c__4589517F");

            entity.HasOne(d => d.StuP).WithMany(p => p.TblStudents)
                .HasForeignKey(d => d.StuPId)
                .HasConstraintName("FK__tblStuden__stu_p__467D75B8");
        });

        modelBuilder.Entity<TblStudentGrade>(entity =>
        {
            entity.HasKey(e => e.StugId).HasName("PK__tblStude__A2A63D5FF04F944B");

            entity.ToTable("tblStudentGrade");

            entity.Property(e => e.StugId)
                .ValueGeneratedNever()
                .HasColumnName("stug_id");
            entity.Property(e => e.StugGcId)
                .HasMaxLength(50)
                .HasColumnName("stug_gc_id");
            entity.Property(e => e.StugGrade).HasColumnName("stug_grade");
            entity.Property(e => e.StugStuId)
                .HasMaxLength(50)
                .HasColumnName("stug_stu_id");

            entity.HasOne(d => d.StugGc).WithMany(p => p.TblStudentGrades)
                .HasForeignKey(d => d.StugGcId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__tblStuden__stug___56B3DD81");

            entity.HasOne(d => d.StugStu).WithMany(p => p.TblStudentGrades)
                .HasForeignKey(d => d.StugStuId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__tblStuden__stug___55BFB948");
        });

        modelBuilder.Entity<TblSubject>(entity =>
        {
            entity.HasKey(e => e.SjId).HasName("PK__tblSubje__143ED2BDE26F8A2D");

            entity.ToTable("tblSubject");

            entity.Property(e => e.SjId)
                .HasMaxLength(50)
                .HasColumnName("sj_id");
            entity.Property(e => e.SjName)
                .HasMaxLength(255)
                .HasColumnName("sj_name");
        });

        modelBuilder.Entity<TblTeacher>(entity =>
        {
            entity.HasKey(e => e.TId).HasName("PK__tblTeach__E579775F5A3D52F8");

            entity.ToTable("tblTeacher");

            entity.Property(e => e.TId)
                .HasMaxLength(50)
                .HasColumnName("t_id");
            entity.Property(e => e.TName)
                .HasMaxLength(255)
                .HasColumnName("t_name");
            entity.Property(e => e.TPassword)
                .HasMaxLength(255)
                .HasColumnName("t_password");
            entity.Property(e => e.TPhone)
                .HasMaxLength(255)
                .HasColumnName("t_phone");
        });

        modelBuilder.Entity<TblTeacherSubject>(entity =>
        {
            entity.HasKey(e => e.TsjId).HasName("PK__tblTeach__1F31BE61763E30E9");

            entity.ToTable("tblTeacherSubject");

            entity.Property(e => e.TsjId)
                .ValueGeneratedNever()
                .HasColumnName("tsj_id");
            entity.Property(e => e.TsjSjId)
                .HasMaxLength(50)
                .HasColumnName("tsj_sj_id");
            entity.Property(e => e.TsjTId)
                .HasMaxLength(50)
                .HasColumnName("tsj_t_id");

            entity.HasOne(d => d.TsjSj).WithMany(p => p.TblTeacherSubjects)
                .HasForeignKey(d => d.TsjSjId)
                .HasConstraintName("FK__tblTeache__tsj_s__4C364F0E");

            entity.HasOne(d => d.TsjT).WithMany(p => p.TblTeacherSubjects)
                .HasForeignKey(d => d.TsjTId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_tblTeacherSubject_tblTeacher");
        });

        modelBuilder.Entity<TblTeacherSubjectClass>(entity =>
        {
            entity.HasKey(e => e.TscId).HasName("PK__tblTeach__31E704CFBF0B196B");

            entity.ToTable("tblTeacherSubjectClass");

            entity.Property(e => e.TscId)
                .ValueGeneratedNever()
                .HasColumnName("tsc_id");
            entity.Property(e => e.TscCId)
                .HasMaxLength(50)
                .HasColumnName("tsc_c_id");
            entity.Property(e => e.TscTsjId).HasColumnName("tsc_tsj_id");

            entity.HasOne(d => d.TscC).WithMany(p => p.TblTeacherSubjectClasses)
                .HasForeignKey(d => d.TscCId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_tblTeacherSubjectClass_tblClass");

            entity.HasOne(d => d.TscTsj).WithMany(p => p.TblTeacherSubjectClasses)
                .HasForeignKey(d => d.TscTsjId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_tblTeacherSubjectClass_tblTeacherSubject");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
