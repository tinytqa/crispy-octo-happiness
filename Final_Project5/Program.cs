
using Final_Project5.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;


//using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var key = builder.Configuration["jwtSetting:key"];
byte[] keyMahoa = Encoding.UTF8.GetBytes(key);

//thêm authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("1234567890qwertyuiopasdfghjklzxcvbnm")),
            ValidateIssuer = false, // Đặt true nếu bạn có một issuer cụ thể
            ValidateAudience = false, // Đặt true nếu bạn có audience cụ thể
            RequireExpirationTime = true,
            ValidateLifetime = true
        };
    });

// Thêm Authorization
builder.Services.AddAuthorization();
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt =>
//{
//    opt.TokenValidationParameters = new TokenValidationParameters
//    {
//        // tự mình cấp mà không thông qua dịch vụ nào cả
//        ValidateIssuer = false,
//        ValidateAudience = false,

//        // ký token
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(keyMahoa),
//        ClockSkew = TimeSpan.Zero
//    };
//});


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string strcnn = builder.Configuration.GetConnectionString("cnn");
builder.Services.AddDbContext<N10Nhom3Context>(p => p.UseSqlServer(strcnn));
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors(opt => opt.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
