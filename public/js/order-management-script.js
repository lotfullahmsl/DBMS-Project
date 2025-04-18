// Example JavaScript for handling edit and delete actions
function editOrder(id) {
    alert('Edit order with ID: ' + id);
    // Add your edit logic here
}

function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        alert('Order with ID ' + id + ' has been deleted.');
        // Add your delete logic here
    }
}
