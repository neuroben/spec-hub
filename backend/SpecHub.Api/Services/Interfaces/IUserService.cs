using SpecHub.Api.Models;

namespace SpecHub.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<User>> GetAllAsync();
}