using SpecHub.Api.Users;
using SpecHub.Api.Repositories.Interfaces;
using SpecHub.Api.Services.Interfaces;

namespace SpecHub.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _userRepository.GetAllAsync();
    }
}