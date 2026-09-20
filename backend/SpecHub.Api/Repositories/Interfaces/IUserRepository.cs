using SpecHub.Api.Models;

namespace SpecHub.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
}