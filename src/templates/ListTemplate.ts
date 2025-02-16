import FullList from "../model/FullList";

interface DOMList {
  ul: HTMLUListElement;
  clear(): void;
  render(fullList: FullList): void;
}

export default class ListTemplate implements DOMList {
  ul: HTMLUListElement;
  checkAllBox: HTMLInputElement;
  removeCheckedButton: HTMLButtonElement;

  static instance: ListTemplate = new ListTemplate();

  private constructor() {
    this.ul = document.getElementById("listItems") as HTMLUListElement;
    this.checkAllBox = document.getElementById("checkAll") as HTMLInputElement;
    this.checkAllBox.addEventListener("change", this.handleCheckAll.bind(this));
    this.removeCheckedButton = document.getElementById(
      "removeCheckedButton"
    ) as HTMLButtonElement;
    this.removeCheckedButton.addEventListener("click", () =>
      this.confirmRemoveCheckedItems()
    );
  }

  confirmRemoveCheckedItems(): void {
    const modal = document.getElementById("modal") as HTMLElement;
    const modalMessage = document.getElementById(
      "modal-message"
    ) as HTMLElement;
    const modalYes = document.getElementById("modal-yes") as HTMLButtonElement;
    const modalCancel = document.getElementById(
      "modal-cancel"
    ) as HTMLButtonElement;

    modalMessage.innerHTML = `<p>Are you sure you want to <strong>DELETE</strong> all checked items?</p>`;
    modal.style.display = "block";

    const handleYesClick = () => {
      this.removeCheckedItems();
      closeModal();
    };

    const handleCancelClick = () => {
      closeModal();
    };

    modalYes.addEventListener("click", handleYesClick, { once: true });
    modalCancel.addEventListener("click", handleCancelClick, { once: true });

    function closeModal(): void {
      modal.style.display = "none";
    }
  }

  clear(): void {
    this.ul.innerHTML = "";
  }

  async handleCheckAll(): Promise<void> {
    const checkAll = this.checkAllBox.checked;
    for (const item of this.ul.querySelectorAll(
      "li .item input[type='checkbox']"
    )) {
      (item as HTMLInputElement).checked = checkAll;
    }

    const fullList = FullList.instance; // Assuming you have a singleton instance of FullList
    fullList.list.forEach((item) => (item.checked = checkAll));
    fullList.save();
    this.render(fullList);
  }

  updateCheckAllBox(fullList: FullList): void {
    const allChecked = fullList.list.every((item) => item.checked);
    this.checkAllBox.checked = allChecked;
  }

  moveItem(
    fullList: FullList,
    draggedIndex: number,
    targetIndex: number
  ): void {
    const itemToMove = fullList.list.splice(draggedIndex, 1)[0];

    // Insert the itemToMove at the targetIndex
    fullList.list.splice(targetIndex, 0, itemToMove);

    // Adjust IDs
    if (draggedIndex < targetIndex) {
      // If moved down, increment IDs of items between draggedIndex and targetIndex
      for (let i = draggedIndex; i <= targetIndex; i++) {
        fullList.list[i].id = (i + 1).toString();
      }
    } else {
      // If moved up, increment IDs of items between targetIndex and draggedIndex
      for (let i = targetIndex; i <= draggedIndex; i++) {
        fullList.list[i].id = (i + 1).toString();
      }
    }
    fullList.save();
    this.render(fullList);
  }

  removeCheckedItems(): void {
    const fullList = FullList.instance;
    fullList.removeCheckedItems();
    this.render(fullList);
  }

  async render(fullList: FullList): Promise<void> {
    this.clear();

    // Add image modal to the DOM if it doesn't exist
    if (!document.getElementById("image-modal")) {
      const imageModal = document.createElement("div");
      imageModal.id = "image-modal";
      imageModal.className = "image-modal";
      imageModal.addEventListener("click", () => {
        imageModal.style.display = "none";
      });
      document.body.appendChild(imageModal);
    }

    let hasCheckedItems = false;
    fullList.list.forEach((item, index) => {
      const li = document.createElement("li") as HTMLLIElement;
      li.className = "item";
      li.draggable = true;
      li.dataset.index = index.toString();

      const check = document.createElement("input") as HTMLInputElement;
      check.type = "checkbox";
      check.id = item.id;
      check.checked = item.checked;
      li.append(check);
      if (item.checked) {
        hasCheckedItems = true;
      }

      check.addEventListener("change", () => {
        item.checked = !item.checked;
        fullList.save();
        this.updateCheckAllBox(fullList);
        this.render(fullList);
      });

      const labelContainer = document.createElement("div") as HTMLDivElement;
      labelContainer.className = "item-content";

      const label = document.createElement("label") as HTMLLabelElement;
      label.htmlFor = item.id;
      label.textContent = item.item;
      label.className = "checkbox-label";
      labelContainer.append(label);

      if (item.image) {
        const imageContainer = document.createElement("div");
        imageContainer.className = "item-image-container";

        const img = document.createElement("img") as HTMLImageElement;
        img.src = item.image;
        img.className = "item-image";

        const deleteButton = document.createElement("button");
        deleteButton.className = "item-image-delete";
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation();
          item.image = "";
          // If there's no text, remove the entire item
          if (!item.item.trim()) {
            fullList.removeItem(item.id);
          } else {
            fullList.save();
          }
          this.render(fullList);
        });

        imageContainer.appendChild(img);
        imageContainer.appendChild(deleteButton);

        img.addEventListener("click", (e) => {
          e.stopPropagation();
          const modal = document.getElementById(
            "image-modal"
          ) as HTMLDivElement;
          const modalImg =
            modal.querySelector("img") || document.createElement("img");
          modalImg.src = item.image;
          if (!modal.contains(modalImg)) {
            modal.appendChild(modalImg);
          }
          modal.style.display = "block";
        });

        labelContainer.append(imageContainer);
      }

      li.append(labelContainer);

      // Inline editing
      label.addEventListener("click", (e) => {
        e.preventDefault();
        const input = document.createElement("input") as HTMLInputElement;
        input.type = "text";
        input.value = item.item;
        input.className = "edit-input";

        // Replace label with input
        label.replaceWith(input);
        input.focus();

        // Add paste event listener for images
        input.addEventListener("paste", async (e: ClipboardEvent) => {
          const items = e.clipboardData?.items;
          if (items) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf("image") !== -1) {
                e.preventDefault();
                // Check if item already has an image
                if (item.image) {
                  return; // Only allow one image per item
                }
                const blob = items[i].getAsFile();
                if (blob) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64Image = event.target?.result as string;
                    item.image = base64Image;
                    fullList.save();
                    this.render(fullList);
                  };
                  reader.readAsDataURL(blob);
                }
              }
            }
          }
        });

        const saveEdit = () => {
          const newText = input.value.trim();
          if (!newText && !item.image) {
            // If no text and no image, remove the item
            fullList.removeItem(item.id);
            this.render(fullList);
            return;
          }
          if (newText) {
            item.item = newText;
            fullList.save();
          }
          const newLabel = document.createElement("label") as HTMLLabelElement;
          newLabel.htmlFor = item.id;
          newLabel.textContent = item.item;
          newLabel.className = "checkbox-label";
          input.replaceWith(newLabel);

          // Reattach click listener to new label
          newLabel.addEventListener("click", (e) => {
            e.preventDefault();
            const input = document.createElement("input") as HTMLInputElement;
            input.type = "text";
            input.value = item.item;
            input.className = "edit-input";
            newLabel.replaceWith(input);
            input.focus();
          });
        };

        input.addEventListener("blur", saveEdit);
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        });
      });

      const button = document.createElement("button") as HTMLButtonElement;
      button.className = "button";
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-trash-can";
      button.appendChild(icon);
      li.append(button);

      button.addEventListener("click", () => {
        fullList.removeItem(item.id);
        this.render(fullList);
      });

      // Drag and drop functionality
      li.addEventListener("dragstart", (e: DragEvent) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", index.toString()); // Use the item's index for data transfer
          e.dataTransfer.effectAllowed = "move";
        }
      });

      li.addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        li.classList.add("drag-over");
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move";
        }
      });

      li.addEventListener("dragleave", (e: DragEvent) => {
        e.stopPropagation();
        li.classList.remove("drag-over");
      });

      li.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedIndex = e.dataTransfer?.getData("text/plain");
        const targetIndex = li.dataset.index;
        if (draggedIndex !== undefined && targetIndex !== undefined) {
          this.moveItem(
            fullList,
            parseInt(draggedIndex),
            parseInt(targetIndex)
          );
        }
        li.classList.remove("drag-over");
      });

      this.ul.appendChild(li);

      // Find the first checked item
      const firstCheckedItem = Array.from(this.ul.children).find((child) => {
        const input = child.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement;
        return input && input.checked;
      });

      if (firstCheckedItem) {
        this.ul.insertBefore(li, firstCheckedItem);
      } else {
        this.ul.appendChild(li);
      }
    });
    this.updateCheckAllBox(fullList);
    this.removeCheckedButton.style.display = hasCheckedItems ? "block" : "none";
  }
}
