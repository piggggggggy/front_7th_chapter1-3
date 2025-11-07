import { Page, Locator } from '@playwright/test';

/**
 * Simulates HTML5 Drag and Drop by dispatching actual DragEvent objects
 *
 * Playwright's dragTo() only simulates mouse movements, not HTML5 D&D events.
 * This helper creates proper DragEvent objects with dataTransfer.
 */
export async function simulateHTML5DragAndDrop(
  page: Page,
  sourceLocator: Locator,
  targetLocator: Locator,
  dragData: unknown
): Promise<void> {
  // Verify elements exist
  await sourceLocator.waitFor({ state: 'visible' });
  await targetLocator.waitFor({ state: 'visible' });

  // Set temporary markers on elements
  await sourceLocator.evaluate((el) => el.setAttribute('data-dnd-source', 'true'));
  await targetLocator.evaluate((el) => el.setAttribute('data-dnd-target', 'true'));

  // Dispatch HTML5 D&D events
  await page.evaluate((data) => {
    const sourceEl = document.querySelector('[data-dnd-source="true"]') as HTMLElement;
    const targetEl = document.querySelector('[data-dnd-target="true"]') as HTMLElement;

    if (!sourceEl || !targetEl) {
      throw new Error('Elements not found with data attributes');
    }

    // Create DataTransfer object (can only be created during drag events)
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('application/json', JSON.stringify(data));
    dataTransfer.effectAllowed = 'move';

    // 1. Fire dragstart on source
    sourceEl.dispatchEvent(
      new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
    );

    // 2. Fire dragenter on target
    targetEl.dispatchEvent(
      new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
    );

    // 3. Fire dragover on target
    targetEl.dispatchEvent(
      new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
    );

    // 4. Fire drop on target
    targetEl.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
    );

    // 5. Fire dragend on source
    sourceEl.dispatchEvent(
      new DragEvent('dragend', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })
    );
  }, dragData);

  // Clean up markers (use first() in case element was duplicated)
  await sourceLocator.first().evaluate((el) => el.removeAttribute('data-dnd-source'));
  await targetLocator.first().evaluate((el) => el.removeAttribute('data-dnd-target'));
}
