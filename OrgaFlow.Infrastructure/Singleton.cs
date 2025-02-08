using Mapster;

namespace OrgaFlow.Infrastructure
{
    public class Singleton
    {
        private static Singleton? _instance;
        private static readonly object _lock = new();

        public TypeAdapterConfig Config { get; }

        private Singleton()
        {
            Config = TypeAdapterConfig.GlobalSettings;
            Config.Scan(typeof(Singleton).Assembly);
        }
        /// <summary>
        /// Singleton instance
        /// </summary>
        public static Singleton Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock) 
                    {
                        if (_instance == null)
                        {
                            _instance = new Singleton();
                        }
                    }
                }
                return _instance;
            }
        }
    }
}