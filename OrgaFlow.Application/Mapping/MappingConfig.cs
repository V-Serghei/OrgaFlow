using AutoMapper;
using Mapster;
using OrgaFlow.Application.Queries.User.GetUsers;
using OrgaFlow.Contracts.Responses;
using OrgaFlow.Domain.Entities;

namespace OrgaFlow.Application.Mapping;

public abstract class MappingConfig
{

    public static void RegisterMaps()
    {
        TypeAdapterConfig<List<User>, GetUserResponse>.NewConfig()
            .Map(dest => dest.UsersDtos, src => src);
        
        TypeAdapterConfig<User, GetUserByIdResponse>.NewConfig()
            .Map(dest => dest.UserDto, src => src);
    }
}