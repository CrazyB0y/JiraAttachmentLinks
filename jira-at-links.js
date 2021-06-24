let host = window.location.hostname;
let ticket = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
let url = "https://" + host + '/rest/api/3/issue/' + ticket;

fetch(url)
    .then(response => {
        if(response.status == 200) {
            return response.json();
        } else {
            setError("Некорректный ответ API Jira");
        }
    })   
    .then(jiraJson => {
        try {
            showAttachments(jiraJson);
        } catch {
            setError("Ошибка при отображении списка вложений");
        }        
    })
    .catch(function(error) {
        setError("Ошибка при получении ответа API Jira");
    }); 

function setError(errorText) {
    addJiraHeader('<small><b>Упс!</b> ' + errorText + '</small>');
}

function showAttachments(jiraJson) {
    addJiraBlanket();
    addJiraHeader('<button class="aui-button" id="showExtAttachmentsButton">Показать ссылки вложений</button>');
    addJiraModal(jiraJson.fields.attachment);       
    document.getElementById("showExtAttachmentsButton").onclick = function() {     
        document.getElementById('jiraCustomBlanket').setAttribute('aria-hidden', 'false');
        document.getElementById('showExtAttachmentsButtonModalDiv').setAttribute('aria-hidden', 'false');
    };    
    document.getElementById("showExtAttachmentsButtonCloseModal").onclick = function() {   
        document.getElementById('jiraCustomBlanket').setAttribute('aria-hidden', 'true');
        document.getElementById('showExtAttachmentsButtonModalDiv').setAttribute('aria-hidden', 'true');
    };   
}

function addJiraHeader(content) {
    let headerDiv = document.getElementById("showExtAttachmentsButtonPanelDiv");
    if(headerDiv != null) {
        headerDiv.innerHTML = content;  
    } else {
        document.getElementById("jira-issue-header-actions").innerHTML 
            += `<div id="showExtAttachmentsButtonPanelDiv" 
            style="margin-top: 20px; z-index:100; color:black; 
            text-align:left;">` + content + `</div>`;  
    }
}

function addJiraBlanket() {
    let headerDiv = document.getElementById("jiraCustomBlanket");
    if(headerDiv == null) {
        document.body.innerHTML 
            += `<div class="aui-blanket" id="jiraCustomBlanket" tabindex="0" style="z-index: 2980;" aria-hidden="true"></div>`;  
    }
}

function addJiraModal(jsonAttachContent) {
    let headerModal = document.getElementById("showExtAttachmentsButtonModalDiv");
    if(headerModal == null) {      
        document.body.innerHTML 
            += `<div id="showExtAttachmentsButtonModalDiv" 
                    class="aui-dialog2 aui-dialog2-xlarge aui-layer" 
                    role="dialog" aria-hidden="true" data-aui-focus="false" 
                    data-aui-blanketed="true" style="z-index: 3000;">
                    <header class="aui-dialog2-header">
                        <h2 class="aui-dialog2-header-main">Список вложений и ссылки на них</h2>
                    </header>
                    <div class="aui-dialog2-content">
                        <table class="aui aui-table-sortable" id="modalAttachTableExt">
                            <thead>
                                <tr>
                                    <th>Имя файла</th>
                                    <th>Размер</th>
                                    <th>Дата добавления</th>
                                    <th>Кто виноват</th>
                                    <th class="aui-table-column-unsortable">Ссылка на загрузку</th>
                                <tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                    <td> </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <footer class="aui-dialog2-footer">
                        <div class="aui-dialog2-footer-actions">
                            <button id="showExtAttachmentsButtonCloseModal" class="aui-button aui-button-primary">Закрыть</button>
                        </div>
                    </footer>
                </div>` 
    }
    var tableRef = document.getElementById('modalAttachTableExt').getElementsByTagName('tbody')[0];
    tableRef.innerHTML = "";
    for (let index = 0; index < jsonAttachContent.length; index++){        
        var shortDownload = jsonAttachContent[index].content.substring(0, jsonAttachContent[index].content.lastIndexOf('/') + 1);        
        var dateTime = new Date(jsonAttachContent[index].created);
        tableRef.insertRow().innerHTML = 
            "<td>" + jsonAttachContent[index].filename + "</td>"+
            "<td>" + Math.trunc(jsonAttachContent[index].size / 1024) + " КБ </td>"+
            "<td>" + dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString() + "</td>"+
            "<td>" + jsonAttachContent[index].author.displayName + "</td>"+
            "<td>" + shortDownload + "</td>";
    }
}