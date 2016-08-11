$(function () {
    $("#new-session")
        .click(function () {
            $.ajax({
                type: "POST",
                url: "/api/Create",
                data: { UserName: "marek", Title: "test" },
                success: function (data) {
                    window.location.href = "/session/" + data.ShortId;
                },
                error: function () {
                    alert("could not create session");
                },
                dataType: "json"
            });
        });
});