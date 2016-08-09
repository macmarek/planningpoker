using System;

namespace PlanningPoker.Models
{
    public class RemoveMemberRequest
    {
        public string ShortId { get; set; }
        public Guid MemberId { get; set; }
    }
}