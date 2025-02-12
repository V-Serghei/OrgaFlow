using Mapster;
using MediatR;
using OrgaFlow.Domain.Interfaces;

namespace OrgaFlow.Application.Commands.User.UserCreate
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, int>
    {
        private readonly IDbRepository _userRepository;

        public CreateUserCommandHandler(IDbRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<int> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user =  _userRepository.AddAsync(request.Adapt<Domain.Entities.User>(), cancellationToken);

            return user.Id;
        }
    }
}