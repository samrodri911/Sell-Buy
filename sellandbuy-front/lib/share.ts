/**
 * Utility to share a product link.
 * @param productId The ID of the product to share
 * @returns A promise that resolves to true if successful, false otherwise
 */
export async function copyProductLink(productId: string): Promise<boolean> {
  try {
    // Si estamos en la página del producto usamos la url actual
    // Si estamos en otra página construimos la ruta
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/products/${productId}`;
    
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Error al copiar el enlace:", error);
    return false;
  }
}
