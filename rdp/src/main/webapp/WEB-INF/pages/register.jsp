<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="UTF-8" />
<title>Rare Disease Project</title>

<!-- Bootstrap core CSS -->
<link href="styles/bootstrap.min.css" rel="stylesheet">

<!-- Optional Bootstrap Theme -->
<link href="data:text/css;charset=utf-8,"
    data-href="styles/bootstrap-theme.min.css" rel="stylesheet"
    id="bs-theme-stylesheet">

</head>

<body id="register">

    <div id="content">

        <!-- Navigation bar -->
        <%@ include file="navbar.jsp"%>

        <!-- Nav tabs -->
        <ul class="nav nav-tabs" role="tablist">
            <li class="active"><a href="#primaryContact" role="tab"
                data-toggle="tab">Primary contact</a></li>
            <li><a href="#primaryInvestigator" role="tab"
                data-toggle="tab">Primary investigator</a></li>
            <!-- 
            <li><a href="#modelOrganism" role="tab"
                data-toggle="tab">Model organism</a></li>
              -->

            <li class="dropdown"><a href="#"
                class="dropdown-toggle" data-toggle="dropdown">Model
                    organism <span class="caret"></span>
            </a>

                <ul class="dropdown-menu" role="menu">
                    <li><a id="moMouse" href="#modelOrganism" role="tab" data-toggle="tab">Mouse</a></li>
                    <li><a id="moRat" href="#modelOrganism" role="tab" data-toggle="tab">Rat</a></li>
                    <li><a id="moMonkey" href="#modelOrganism" role="tab" data-toggle="tab">Monkey</a></li>
                    <li><a id="moFly" href="#modelOrganism" role="tab" data-toggle="tab">Fly</a></li>
                    <li><a id="moWorm" href="#modelOrganism" role="tab" data-toggle="tab">Worm</a></li>
                    <li class="divider"></li>
                    <li><a id="moAddNew" href="#modelOrganism"
                        role="tab" data-toggle="tab">Add New</a></li>
                </ul></li>

        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <div class="tab-pane active" id="primaryContact">
                <br />
                <%@ include file="primaryContact.jsp"%>
            </div>
            <div class="tab-pane" id="primaryInvestigator">
                <br />
                <%@ include file="primaryInvestigator.jsp"%>
            </div>
            <div class="tab-pane" id="modelOrganism">
                <br />
                <%@ include file="modelOrganism.jsp"%>
            </div>
        </div>

    </div>

    <!-- include jQuery, and our script file -->
    <script src="scripts/lib/jquery-1.11.1.min.js"></script>
    <script src="scripts/lib/bootstrap.min.js"></script>
    <script src="scripts/lib/jquery.validate.min.js"></script>

    <!-- Our scripts -->
    <script src="scripts/api/register.js"></script>

</body>
</html>