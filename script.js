const ctx = document.getElementById('myChart');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Completed', 'Pending', 'Rejected'],
        datasets: [{
            data: [60, 25, 15],
            backgroundColor: [
                '#4CAF50', 
                '#FFC107', 
                '#F44336' 
            ],
            borderWidth: 0
        }]
    },
    options: {
        cutout: '65%', // hila
        plugins: {
           legend: {
                position: 'bottom'
            }
        }
    }
});

