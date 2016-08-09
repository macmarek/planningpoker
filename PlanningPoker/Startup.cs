using Microsoft.Owin;
using Owin;
using PlanningPoker;

[assembly: OwinStartup(typeof(Startup))]

namespace PlanningPoker
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}