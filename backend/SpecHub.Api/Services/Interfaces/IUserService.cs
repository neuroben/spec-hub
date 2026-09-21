using SpecHub.Api.Users;

namespace SpecHub.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<User>> GetAllAsync();
}