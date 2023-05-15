

export const init = async model => {


    model.setTable(false);
    model.setRoom(false);
    if(window.CD === 0){
        window.CD = 1;
        return
    }
    let file_input = document.getElementById('fileInput');
    file_input.addEventListener('change', function selectedFileChanged() {
        console.log("click", file_input.files);
        if(file_input.files.length === 0)
            return;
        const reader = new FileReader();
        reader.onload = function fileReadCompleted() {
            console.log("result......");
            //sandbox.setScene(reader.result);
            window.temporal = reader.result;

        };
        reader.readAsText(this.files[0]);
    });
    file_input.click();
    window.CD = 0;

}

