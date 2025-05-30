

document.addEventListener('DOMContentLoaded', function () {
    // Initial row count
    let rowCount = 1;

    // Setup undo/redo functionality
    const stateHistory = [];
    let currentStateIndex = -1;

    // Function to get current state
    function getCurrentState() {
        const rows = document.querySelectorAll('#processTableBody tr');
        const state = {
            activity: document.getElementById('activity').value,
            studentName: document.getElementById('studentName').value,
            date: document.getElementById('date').value,
            rows: []
        };

        rows.forEach(row => {
            const rowData = {
                description: row.querySelector('.description-input').value,
                distance: row.querySelector('.distance-input').value,
                time: row.querySelector('.time-input').value,
                notes: row.querySelector('.notes-input').value,
                selectedSymbol: ''
            };

            const symbols = ['operation', 'transport', 'delay', 'inspection', 'store'];
            symbols.forEach(symbol => {
                if (row.querySelector(`.${symbol}`)?.classList.contains('symbol-selected')) {
                    rowData.selectedSymbol = symbol;
                }
            });

            state.rows.push(rowData);
        });

        return state;
    }

    // Function to restore state
    function restoreState(state) {
        document.getElementById('activity').value = state.activity;
        document.getElementById('studentName').value = state.studentName;
        document.getElementById('date').value = state.date;

        const tbody = document.getElementById('processTableBody');
        tbody.innerHTML = '';

        state.rows.forEach((rowData, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="description-input" value="${rowData.description}" placeholder="Write Your Definition"></td>
                <td><input type="number" class="distance-input" value="${rowData.distance}" placeholder="0"></td>
                <td><input type="number" class="time-input" value="${rowData.time}" placeholder="0"></td>
                <td class="symbol-cell operation" data-symbol="operation"><div class="operation-symbol"></div></td>
                <td class="symbol-cell transport" data-symbol="transport"><div class="transport-symbol"></div></td>
                <td class="symbol-cell delay" data-symbol="delay"><div class="delay-symbol"></div></td>
                <td class="symbol-cell inspection" data-symbol="inspection"><div class="inspection-symbol"></div></td>
                <td class="symbol-cell store" data-symbol="store"><div class="store-symbol"></div></td>
                <td><input type="text" class="notes-input" value="${rowData.notes}" placeholder="Notes"></td>
                <td class ="no-print"><button class="action-button delete-row">⊖</button></td>
            `;

            tbody.appendChild(newRow);
            addRowListeners(newRow);

            if (rowData.selectedSymbol) {
                newRow.querySelector(`.${rowData.selectedSymbol}`)?.classList.add('symbol-selected');
            }
        });

        updateRowNumbers?.();
        updateCounts?.();
        updateMetrics?.();
    }

    function getDiagramFromStorage(key) {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    }

    function loadFromStorageIfRequested() {
        const params = new URLSearchParams(window.location.search);
        const diagramKey = params.get('diagram');
        if (diagramKey) {
            const savedData = getDiagramFromStorage(diagramKey);
            if (savedData) {
                restoreState(savedData);
            } else {
                alert('Diagram not found.');
            }
        }
    }

    // Function to save state
    function saveState() {
        // Remove future states if we're in the middle of the history
        if (currentStateIndex < stateHistory.length - 1) {
            stateHistory.splice(currentStateIndex + 1);
        }

        const state = getCurrentState();
        stateHistory.push(state);
        currentStateIndex = stateHistory.length - 1;

        // Enable/disable undo/redo buttons
        document.getElementById('undo').disabled = currentStateIndex <= 0;
        document.getElementById('redo').disabled = currentStateIndex >= stateHistory.length - 1;
    }

    // Save initial state
    saveState();

    // Undo button
    document.getElementById('undo').addEventListener('click', function () {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            restoreState(stateHistory[currentStateIndex]);
            document.getElementById('undo').disabled = currentStateIndex <= 0;
            document.getElementById('redo').disabled = false;
        }
    });

    // Redo button
    document.getElementById('redo').addEventListener('click', function () {
        if (currentStateIndex < stateHistory.length - 1) {
            currentStateIndex++;
            restoreState(stateHistory[currentStateIndex]);
            document.getElementById('redo').disabled = currentStateIndex >= stateHistory.length - 1;
            document.getElementById('undo').disabled = false;
        }
    });

    //logout button
    document.getElementById('logout').addEventListener('click', function () {
        if (confirm("Are you sure you want to exit ?")) {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        }
    });

    //back button
    document.getElementById('back').addEventListener('click', function () {
        window.location.href = "my-diagrams.html";
    });


    // Add row event listener
    document.getElementById('addRow').addEventListener('click', function () {
        rowCount++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" class="description-input" placeholder="Write Your Definition"></td>
            <td><input type="number" class="distance-input" placeholder="0"></td>
            <td><input type="number" class="time-input" placeholder="0"></td>
            <td class="symbol-cell operation" data-symbol="operation"><div class="operation-symbol"></div></td>
            <td class="symbol-cell transport" data-symbol="transport"><div class="transport-symbol"></div></td>
            <td class="symbol-cell delay" data-symbol="delay"><div class="delay-symbol"></div></td>
            <td class="symbol-cell inspection" data-symbol="inspection"><div class="inspection-symbol"></div></td>
            <td class="symbol-cell store" data-symbol="store"><div class="store-symbol"></div></td>
            <td><input type="text" class="notes-input" placeholder="Notes"></td>
            <td class ="no-print"><button class="action-button delete-row">⊖</button></td>
        `;
        document.getElementById('processTableBody').appendChild(newRow);

        // Add event listeners to the new row
        addRowListeners(newRow);

        // Save state after adding row
        saveState();
    });

    // Function to add event listeners to a row
    function addRowListeners(row) {
        
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', function () {
                saveState();
            });
        });

        // Delete row functionality
        row.querySelector('.delete-row').addEventListener('click', function () {
            if (document.querySelectorAll('#processTableBody tr').length > 1) {
                row.remove();
                updateRowNumbers();
                updateCounts();
                saveState();
            }
        });

        // Symbol selection functionality
        const symbolCells = row.querySelectorAll('.symbol-cell');
        symbolCells.forEach(cell => {
            cell.addEventListener('click', function () {
                
                symbolCells.forEach(c => c.classList.remove('symbol-selected'));

                
                this.classList.add('symbol-selected');

                
                updateCounts();

                
                saveState();
            });
        });
    }

    // Function to update row numbers
    function updateRowNumbers() {
        const rows = document.querySelectorAll('#processTableBody tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
        rowCount = rows.length;
    }

    // Function to update activity counts
    function updateCounts() {
        const operationCount = document.querySelectorAll('.operation.symbol-selected').length;
        const transportCount = document.querySelectorAll('.transport.symbol-selected').length;
        const delayCount = document.querySelectorAll('.delay.symbol-selected').length;
        const inspectionCount = document.querySelectorAll('.inspection.symbol-selected').length;
        const storeCount = document.querySelectorAll('.store.symbol-selected').length;

        document.getElementById('operationCount').textContent = operationCount;
        document.getElementById('transportCount').textContent = transportCount;
        document.getElementById('delayCount').textContent = delayCount;
        document.getElementById('inspectionCount').textContent = inspectionCount;
        document.getElementById('storeCount').textContent = storeCount;
    }

    // Update fonksyionları
    function updateMetrics() {
        let totalDistance = 0;
        let totalTime = 0;
        let valueAddedTime = 0;
        let nonValueAddedTime = 0;

        const rows = document.querySelectorAll('#processTableBody tr');
        rows.forEach(row => {
            const distance = parseFloat(row.querySelector('.distance-input').value) || 0;
            const time = parseFloat(row.querySelector('.time-input').value) || 0;

            totalDistance += distance;
            totalTime += time;

            
            if (row.querySelector('.operation.symbol-selected') ||
                row.querySelector('.inspection.symbol-selected')) {
                valueAddedTime += time;
            } else {
                nonValueAddedTime += time;
            }
        });

        const valueAddedPercentage = totalTime > 0 ? (valueAddedTime / totalTime * 100).toFixed(2) : 0;
        const nonValueAddedPercentage = totalTime > 0 ? (nonValueAddedTime / totalTime * 100).toFixed(2) : 0;

        document.getElementById('totalDistance').textContent = totalDistance;
        document.getElementById('totalTime').textContent = totalTime;
        document.getElementById('totalValueAddedTime').textContent = valueAddedTime;
        document.getElementById('totalNonValueAddedTime').textContent = nonValueAddedTime;
        document.getElementById('valueAddedPercentage').textContent = valueAddedPercentage + '%';
        document.getElementById('nonValueAddedPercentage').textContent = nonValueAddedPercentage + '%';
    }

    // Update Buton
    document.getElementById('update').addEventListener('click', function () {
        updateMetrics();
        saveState();
    });

    // Reset Buton
    document.getElementById('reset').addEventListener('click', function () {
        if (confirm('Are you sure you want to reset all data?')) {
            // Clear the table except for first row
            const tbody = document.getElementById('processTableBody');

            // Tüm satırları sil
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }

            // Yeni boş bir satır ekle
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td>1</td>
            <td><input type="text" class="description-input" placeholder="Write Your Definition"></td>
            <td><input type="number" class="distance-input" placeholder="0"></td>
            <td><input type="number" class="time-input" placeholder="0"></td>
            <td class="symbol-cell operation" data-symbol="operation"><div class="operation-symbol"></div></td>
            <td class="symbol-cell transport" data-symbol="transport"><div class="transport-symbol"></div></td>
            <td class="symbol-cell delay" data-symbol="delay"><div class="delay-symbol"></div></td>
            <td class="symbol-cell inspection" data-symbol="inspection"><div class="inspection-symbol"></div></td>
            <td class="symbol-cell store" data-symbol="store"><div class="store-symbol"></div></td>
            <td><input type="text" class="notes-input" placeholder="Notes"></td>
            <td class ="no-print"><button class="action-button delete-row">⊖</button></td>
            `;
            tbody.appendChild(newRow);
            addRowListeners(newRow);

            // Form inputlarını sıfırla
            document.getElementById('activity').value = '';
            document.getElementById('studentName').value = '';
            document.getElementById('date').value = '';

            // Metrikleri sıfırla
            document.getElementById('totalDistance').textContent = '0';
            document.getElementById('totalTime').textContent = '0';
            document.getElementById('totalValueAddedTime').textContent = '0';
            document.getElementById('totalNonValueAddedTime').textContent = '0';
            document.getElementById('valueAddedPercentage').textContent = '0%';
            document.getElementById('nonValueAddedPercentage').textContent = '0%';

            // Sayıları sıfırla
            document.getElementById('operationCount').textContent = '0';
            document.getElementById('transportCount').textContent = '0';
            document.getElementById('delayCount').textContent = '0';
            document.getElementById('inspectionCount').textContent = '0';
            document.getElementById('storeCount').textContent = '0';

            // Row sayısını sıfırla
            rowCount = 1;

            // Değişiklikleri uygula
            updateCounts();
            updateMetrics();
            saveState();
        }
    });



    // PDF Alma button 
    document.getElementById('getPdf').addEventListener('click', pdfAlma);
    document.getElementById('getPdff').addEventListener('click', pdfAlma);
    function pdfAlma() {
        const istek1 = document.getElementById("activity").value.trim();
        const istek2 = document.getElementById("studentName").value.trim();
        const istek3 = document.getElementById("date").value.trim();
        if (istek1 === "" || istek2 === "" || istek3 === "") {
            alert("Lütfen Activiy & StudentName & Date Alanlarını Doldurunuz")
            return;
        }

        const element = document.getElementById("pdfbody"); 
        const hiddenElements = document.querySelectorAll('.no-print');
        hiddenElements.forEach(el => el.style.display = 'none');

        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg');

            document.getElementById('pdfPreviewImage').src = imgData;
            document.getElementById('pdfPreviewModal').style.display = 'flex';

            document.getElementById("downloadPdf").onclick = function () {
                const opt = {
                    scale: 0.1,
                    margin: 0.5, 
                    filename: 'process-flow.pdf',
                    image: { type: 'jpeg', quality: 1 },
                    html2canvas: {
                        transform: 5,
                        scale: 3,           
                        useCORS: true
                    },
                    jsPDF: {
                        unit: 'in',
                        format: 'a4',
                        orientation: 'landscape'
                    }
                };


                html2pdf().set(opt).from(element).save().then(() => {
                    document.getElementById('pdfPreviewModal').style.display = 'none';
                    hiddenElements.forEach(el => el.style.display = '');
                });
            };
        });
    };

    window.closePreview = function () {
        document.getElementById('pdfPreviewModal').style.display = 'none';

        const hiddenElements = document.querySelectorAll('.no-print');
        hiddenElements.forEach(el => el.style.display = '');
    }



    // Add event listeners to initial rows
    document.querySelectorAll('#processTableBody tr').forEach(row => {
        addRowListeners(row);
    });

    // Set initial selection for first row (Operation)
    document.querySelector('#processTableBody tr:first-child .operation').classList.add('symbol-selected');
    updateCounts();

    loadFromStorageIfRequested();

    document.getElementById('saveDiagram').addEventListener('click', function () {
        const title = prompt('Enter a name for your diagram:');
        if (title) {
            const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!currentUser) {
                alert("Lütfen önce giriş yapın.");
                window.location.href = "login.html";
                return;
            }

            const state = getCurrentState();
            state.title = title;
            state.owner = currentUser.username; 
            const key = 'diagram_' + Date.now();
            localStorage.setItem(key, JSON.stringify(state));
            alert('Diagram saved!');
        }
    });

});