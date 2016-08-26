using System.Web;
using System.Web.Mvc;

namespace PlanningPoker.Helpers
{
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            var auth = httpContext.Request.QueryString["auth"];

            if (string.IsNullOrEmpty(auth))
            {
                return false;
            }

            if (auth != Constants.AuthPassword)
            {
                return false;
            }

            return true;
        }
    }
}