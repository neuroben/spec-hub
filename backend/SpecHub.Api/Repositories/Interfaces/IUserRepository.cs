using SpecHub.Api.Users;

namespace SpecHub.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
}