using MediatR;

namespace OrgaFlow.Application.Commands.User.UserCreate
{
    public class CreateUserCommand(string firstName, string lastName, string email, string password)
        : IRequest<int>;
}