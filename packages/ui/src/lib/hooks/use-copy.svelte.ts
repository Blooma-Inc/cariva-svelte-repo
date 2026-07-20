export function useCopy(getText: () => string, getMessage: () => string = () => 'Copied') {
  let buttonText = $state('Copy');

  const handleCopy = () => {
    navigator.clipboard
      .writeText(getText())
      .then(() => {
        buttonText = getMessage();
        setTimeout(() => {
          buttonText = 'Copy';
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy the link:', err);
      });
  };

  return {
    get buttonText() {
      return buttonText;
    },
    get handleCopy() {
      return handleCopy();
    }
  };
}
