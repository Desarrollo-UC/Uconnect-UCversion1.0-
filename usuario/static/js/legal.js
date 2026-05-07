function mostrarDivLegal(id, event) {
    
    const divLegal = document.querySelectorAll('.divLegal');
    divLegal.forEach((div) => {
        if (div.id === id) {
            if (div.style.display === 'none') {
                div.style.display = '';
            } else {
                div.style.display = 'none';
            }
        } else {
            div.style.display = 'none';
        }
    });
}