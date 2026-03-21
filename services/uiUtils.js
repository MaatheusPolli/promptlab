/**
 * Utilitários globais de UI para o PromptLab
 */
export const uiUtils = {
  /**
   * Exibe um modal de confirmação customizado em vez do confirm() nativo.
   * @param {string} title Título do modal
   * @param {string} message Mensagem descritiva
   * @returns {Promise<boolean>} Retorna true se confirmado, false se cancelado
   */
  confirm: (title, message) => {
    return new Promise((resolve) => {
      const modal = document.getElementById('custom-modal');
      const titleEl = document.getElementById('modal-title');
      const messageEl = document.getElementById('modal-message');
      const btnConfirm = document.getElementById('modal-confirm');
      const btnCancel = document.getElementById('modal-cancel');

      if (!modal) {
        // Fallback para o nativo se o HTML não estiver pronto
        resolve(window.confirm(message));
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.classList.remove('hidden');

      const cleanup = (result) => {
        modal.classList.add('hidden');
        btnConfirm.removeEventListener('click', onConfirm);
        btnCancel.removeEventListener('click', onCancel);
        resolve(result);
      };

      const onConfirm = () => cleanup(true);
      const onCancel = () => cleanup(false);

      btnConfirm.addEventListener('click', onConfirm);
      btnCancel.addEventListener('click', onCancel);
      
      // Fechar ao clicar fora do conteúdo
      modal.addEventListener('click', (e) => {
        if (e.target === modal) cleanup(false);
      }, { once: true });
    });
  }
};
