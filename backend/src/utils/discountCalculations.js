// Example helper function - place this in a suitable location like a utility file
// or at the top of payment/wallet controllers

export const calculateItemPrice = (product, quantity) => {
    let effectiveDiscountPercentage = product.discountPercentage || 0; // Base discount

    // Apply additional bulk discount if conditions are met
    if (product.bulkThreshold && quantity >= product.bulkThreshold) {
        effectiveDiscountPercentage += (product.additionalBulkDiscountPercentage || 0);
    }

    // Ensure the total effective discount does not exceed 100%
    effectiveDiscountPercentage = Math.min(effectiveDiscountPercentage, 100);

    const discountedPricePerUnit = product.price * (1 - (effectiveDiscountPercentage / 100));

    // Return the calculated price per unit and the total price for the given quantity
    return {
        pricePerUnit: discountedPricePerUnit,
        totalItemPrice: discountedPricePerUnit * quantity,
        appliedDiscountPercentage: effectiveDiscountPercentage // Useful for logging or display
    };
};