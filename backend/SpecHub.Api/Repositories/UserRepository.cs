using Microsoft.EntityFrameworkCore;
using SpecHub.Api.Data;
using SpecHub.Api.Models;
using SpecHub.Api.Repositories.Interfaces;

namespace SpecHub.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .ToListAsync();
    }
}