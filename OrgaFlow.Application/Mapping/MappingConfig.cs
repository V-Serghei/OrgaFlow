using System.Collections.Generic;
using AutoMapper;
using Mapster;
using OrgaFlow.Application.Commands.User.UserCreate;
using OrgaFlow.Application.Queries.User.GetUsers;
using OrgaFlow.Contracts.DTO.Request;
using OrgaFlow.Contracts.Models;
using OrgaFlow.Contracts.Requests;
using OrgaFlow.Contracts.Requests.User;
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

        TypeAdapterConfig<User, UserCreateRequest>.NewConfig()
            .Map(dest => dest.UserData, src => src);
        TypeAdapterConfig<UserCreateRequest, User>.NewConfig()
            .Map(dest => dest, src => src.UserData)
            .Map(dest => dest.PasswordHash, src => src.UserData.Password);
        TypeAdapterConfig<UserModelView, UserUpdateRequest>.NewConfig()
            .Map(dest => dest.UserData, src => src);
        TypeAdapterConfig<UserUpdateRequest, User>.NewConfig()
            .Map(dest => dest, src => src.UserData);

        TypeAdapterConfig<User, UserCreatResponse>.NewConfig()
            .Map(dest => dest.UserDto, src => src);

        TypeAdapterConfig<UserModelView, UserCreateRequest>.NewConfig()
            .Map(dist => dist.UserData, src => src);
        TypeAdapterConfig<UserRegisterRequest, UserCreateRequest>.NewConfig()
            .Map(dist => dist.UserData, src => src);
        TypeAdapterConfig<UserCreateRequest, UserRegisterRequest>.NewConfig()
            .Map(dist => dist, src => src.UserData);
        TypeAdapterConfig<UserLoginResponse, User>.NewConfig()
            .Map(dist => dist, src => src.User);
        TypeAdapterConfig<User, UserLoginResponse>.NewConfig()
            .Map(dist => dist.User, src => src);
    }
}