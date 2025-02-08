using System;
using Mapster;

namespace OrgaFlow.Infrastructure
{
    public class SingletonConfig
    {
        private static readonly Lazy<SingletonConfig> _instance = new(() => new SingletonConfig());

        public static SingletonConfig Instance => _instance.Value;

        public TypeAdapterConfig Config { get; }

        private SingletonConfig()
        {
            Config = TypeAdapterConfig.GlobalSettings;
            Config.Scan(typeof(SingletonConfig).Assembly);
        }
    }
}