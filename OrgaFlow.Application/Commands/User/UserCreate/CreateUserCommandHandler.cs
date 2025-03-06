using Mapster;
using MediatR;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Interfaces;
using OrgaFlow.Domain.Entities;
using OrgaFlow.Persistence.Repository;

namespace OrgaFlow.Application.Commands.User.UserCreate
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserCreatResponse>
    {
        private readonly IDbRepository _userRepository;

        public CreateUserCommandHandler(IDbRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserCreatResponse> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.AddAsync(request.UserData.Adapt<Domain.Entities.User>(), cancellationToken);
            var response = user.Adapt<UserCreatResponse>();
            return response;
        }
    }
}