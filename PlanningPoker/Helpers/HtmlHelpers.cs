using System;
using System.Web.Mvc;

namespace PlanningPoker.Helpers
{
    public static class HtmlHelpers
    {
        public static string ExpiryDate(this HtmlHelper helper, DateTime date)
        {
            return date.ToString("dd.MM.yyyy HH:mm:ss") + "UTC";
        }

        public static string ExpiryDate<TModel>(this HtmlHelper<TModel> helper, DateTime date)
        {
            return date.ToString("dd.MM.yyyy HH:mm:ss") + "UTC";
        }

        public static string AuthUrl(this UrlHelper helper, string action, dynamic routeValues)
        {
            return helper.Action(action, routeValues)+"&auth="+Constants.AuthPassword;
        }

        public static string AuthUrl(this UrlHelper helper, string action)
        {
            return helper.Action(action) + "?auth=" + Constants.AuthPassword;
        }
    }
}