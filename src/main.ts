import "./css/style.css";
import FullList from "./model/FullList";
import ListItem from "./model/ListItem";
import ListTemplate from "./templates/ListTemplate";
import PullToRefresh from "pulltorefreshjs";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const initApp = async (): Promise<void> => {
  const loaderContainer = document.getElementById(
    "loaderContainer"
  ) as HTMLDivElement;
  const loginContainer = document.getElementById(
    "loginContainer"
  ) as HTMLDivElement;
  const appContainer = document.getElementById(
    "appContainer"
  ) as HTMLDivElement;

  // Handle auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loaderContainer.style.display = "none";
      loginContainer.style.display = "none";
      appContainer.style.display = "block";
      initializeApp();
    } else {
      loaderContainer.style.display = "none";
      loginContainer.style.display = "block";
      appContainer.style.display = "none";
    }
  });

  // Handle login form submission
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  const loginError = document.getElementById("loginError") as HTMLDivElement;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      loginError.style.display = "none";
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      loginError.textContent = "Invalid email or password";
      loginError.style.display = "block";
    }
  });

  const initializeApp = async (): Promise<void> => {
    const fullList = FullList.instance;
    const template = ListTemplate.instance;

    const modal = document.getElementById("modal") as HTMLElement;
    const modalMessage = document.getElementById(
      "modal-message"
    ) as HTMLElement;
    const modalYes = document.getElementById("modal-yes") as HTMLButtonElement;
    const modalCancel = document.getElementById(
      "modal-cancel"
    ) as HTMLButtonElement;

    // Function to show modal with a specific message and callback
    function showModal(message: string, callback: () => void): void {
      modalMessage.innerHTML = message;
      modal.style.display = "block";

      const handleYesClick = () => {
        callback();
        closeModal();
      };

      const handleCancelClick = () => {
        closeModal();
      };

      modalYes.addEventListener("click", handleYesClick, { once: true });
      modalCancel.addEventListener("click", handleCancelClick, { once: true });
    }

    // Function to close modal
    function closeModal(): void {
      modal.style.display = "none";
    }

    // Add listener to new entry form submit
    const itemEntryForm = document.getElementById(
      "itemEntryForm"
    ) as HTMLFormElement;

    const newItemInput = document.getElementById("newItem") as HTMLInputElement;

    newItemInput.addEventListener("paste", async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              e.preventDefault(); // Only prevent default if an image is pasted

              // Remove existing preview if any
              const existingPreview =
                newItemInput.parentElement?.querySelector(".preview-container");
              if (existingPreview) {
                existingPreview.remove();
              }

              // Convert blob to base64
              const reader = new FileReader();
              reader.onload = (event) => {
                const base64Image = event.target?.result as string;
                newItemInput.setAttribute("data-image", base64Image);

                // Create container for preview and delete button
                const previewContainer = document.createElement("div");
                previewContainer.className = "preview-container";
                previewContainer.style.position = "relative";
                previewContainer.style.display = "inline-block";
                previewContainer.style.alignItems = "center";
                previewContainer.style.marginLeft = "10px";

                const preview = document.createElement("img");
                preview.src = base64Image;
                preview.style.maxWidth = "100px";
                preview.style.maxHeight = "100px";
                preview.style.display = "block";

                const deleteButton = document.createElement("button");
                deleteButton.innerHTML =
                  '<i class="fa-solid fa-trash-can"></i>';
                deleteButton.className = "button preview-delete-btn";
                deleteButton.style.position = "absolute";
                deleteButton.style.top = "0";
                deleteButton.style.right = "0";
                deleteButton.style.transform = "translate(0, 0)";
                deleteButton.style.padding = "4px";
                deleteButton.style.minWidth = "24px";
                deleteButton.style.minHeight = "24px";
                deleteButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

                deleteButton.addEventListener(
                  "click",
                  (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    newItemInput.removeAttribute("data-image");
                    previewContainer.remove();
                  },
                  { once: true }
                );

                previewContainer.appendChild(preview);
                previewContainer.appendChild(deleteButton);
                newItemInput.parentElement?.appendChild(previewContainer);
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    });

    itemEntryForm.addEventListener("submit", (event: SubmitEvent): void => {
      event.preventDefault();

      const input = document.getElementById("newItem") as HTMLInputElement;
      const newEntryText: string = input.value.trim();
      const pastedImage: string = input.getAttribute("data-image") || "";

      if (!newEntryText.length && !pastedImage) return;

      const itemId: number = fullList.list.length
        ? parseInt(fullList.list[fullList.list.length - 1].id) + 1
        : 1;

      const newItem = new ListItem(
        itemId.toString(),
        newEntryText,
        false,
        pastedImage
      );
      fullList.addItem(newItem);
      template.render(fullList);

      // Clear input and remove preview container
      input.value = "";
      input.removeAttribute("data-image");
      const previewContainer =
        input.parentElement?.querySelector(".preview-container");
      if (previewContainer) {
        previewContainer.remove();
      }
    });

    // Add listener to "Clear" button
    const clearItems = document.getElementById(
      "clearItemsButton"
    ) as HTMLButtonElement;

    clearItems.addEventListener("click", async (): Promise<void> => {
      showModal(
        `Are you sure you want to <strong>CLEAR</strong> all items?`,
        () => {
          fullList.clearList();
          template.clear();
        }
      );
    });

    // load initial data
    await fullList.load();
    // initial render of template
    template.render(fullList);
  };
};

document.addEventListener("DOMContentLoaded", initApp);
const standalone = window.matchMedia("(display-mode: standalone)").matches;

if (standalone) {
  PullToRefresh.init({
    onRefresh() {
      window.location.reload();
    },
  });
}
