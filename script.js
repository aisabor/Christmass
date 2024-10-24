const apiKey = 'AIzaSyAQ5EPqP-JsPkSBBpM6zRPWsJJKzjbUEO8';

        // Function to find services based on postcode
        async function findServices() {
            const postcode = encodeURIComponent(document.getElementById('postcodeInput').value.trim());

            if (!postcode) {
                alert('Please enter your postcode.');
                return;
            }

            try {
                console.log(`Fetching information for postcode: ${postcode}`);
                
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${postcode}&key=${apiKey}`);
                
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Data received from API:', data);

                if (data && data.results && data.results.length > 0) {
                    const addressComponents = data.results[0].address_components;
                    const streetName = getAddressComponent(addressComponents, 'route');
                    const city = getAddressComponent(addressComponents, 'locality');
                    const county = getAddressComponent(addressComponents, 'administrative_area_level_2');
                    const country = getAddressComponent(addressComponents, 'country');

                    const houseNumbers = Array.from({ length: 50 }, (_, i) => (i + 1).toString());
                    populateAddressDropdown(houseNumbers, streetName, city, county, country);
                } else {
                    console.error('No result found for this postcode:', data);
                    document.getElementById('councilInfo').innerHTML = `<p>No council information found for this postcode.</p>`;
                }
            } catch (error) {
                console.error('Error fetching council data:', error);
                document.getElementById('councilInfo').innerHTML = `<p>Error fetching council information. Please check the console for more details.</p>`;
            }
        }

        function getAddressComponent(components, type) {
            const component = components.find(comp => comp.types.includes(type));
            return component ? component.long_name : null;
        }

        function populateAddressDropdown(houseNumbers, streetName, city, county, country) {
            const addressList = document.getElementById('addressList');
            addressList.innerHTML = '';

            const addressSelection = document.createElement('select');
            addressSelection.id = 'addressSelection';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Select Your Address';
            addressSelection.appendChild(defaultOption);

            houseNumbers.forEach((number) => {
                const option = document.createElement('option');
                option.value = `${number}, ${streetName}, ${city}, ${county}, ${country}`;
                option.text = `${number}, ${streetName}, ${city}, ${county}, ${country}`;
                addressSelection.appendChild(option);
            });

            addressList.appendChild(addressSelection);
            addressSelection.addEventListener('change', () => {
                displayCompleteAddress(addressSelection.value);
                document.getElementById('dateTimeSection').style.display = 'block';
                document.getElementById('submitBtn').style.display = 'block';
            });

            document.getElementById('uploadSection').style.display = 'block';
        }

        function displayCompleteAddress(completeAddress) {
            const addressDisplay = document.getElementById('completeAddress');
            addressDisplay.innerText = `Selected Address: ${completeAddress}`;
            addressDisplay.style.display = 'block';
        }

        function handleImageUpload(event) {
            const fileInput = document.getElementById('imageInput');
            const imageDisplaySection = document.getElementById('imageDisplay');

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    imageDisplaySection.innerHTML = ''; 

                    const img = document.createElement('img');
                    img.src = e.target.result; 
                    img.style.maxWidth = '100%'; 
                    img.style.maxHeight = '900px'; 
                    img.style.objectFit = 'cover'; 

                    imageDisplaySection.appendChild(img);
                }

                reader.readAsDataURL(fileInput.files[0]);
            }
        }

        function storeInBasket(requestData) {
            let basket = JSON.parse(localStorage.getItem('basket')) || [];
            basket.push(requestData);
            localStorage.setItem('basket', JSON.stringify(basket));
        }

        function redirectToConfirmation() {
            window.location.href = 'confirmation.html';
        }

        function submitRequest() {
            const postcode = document.getElementById('postcodeInput').value.trim();
            const selectedAddress = document.getElementById('completeAddress').innerText.replace('Selected Address: ', '');
            const collectionDate = document.getElementById('dateInput').value;
            const collectionTime = document.getElementById('timeInput').value;
            const imageData = document.getElementById('imageDisplay').querySelector('img') ? 
                              document.getElementById('imageDisplay').querySelector('img').src : '';

            const requestData = {
                postcode,
                selectedAddress, 
                collectionDate,
                collectionTime,
                imageData,
                cost: 20 
            };

            storeInBasket(requestData);
            redirectToConfirmation();
        }

        function displayConfirmation() {
            const basket = JSON.parse(localStorage.getItem('basket'));
            const confirmationDetails = document.getElementById('confirmationDetails');

            if (basket && basket.length > 0) {
                const { postcode, selectedAddress } = basket[0];
                confirmationDetails.innerHTML = 
                    `<p><strong>Postcode:</strong> ${postcode || 'N/A'}</p>
                    <p><strong>Selected Address:</strong> ${selectedAddress || 'N/A'}</p>`;
            } else {
                confirmationDetails.innerHTML = `<p>No information found.</p>`;
            }
        }

        if (document.title === 'Confirmation Page') {
            displayConfirmation();
        }

        // Updated gallery functionalities
        let likeCounts = {}; // Object to store like counts for each image
        let comments = {}; // Object to store comments for each image
        let currentImageIndex = 0; // Track the currently displayed image index
        const images = [
            "images/Designer.jpeg",
            "images/Designer1.jpeg",
            "images/Designer2.jpeg",
            "images/Designer3.jpeg",
            "images/Designer4.jpeg",
            "images/Designer5.jpeg",
            "images/Designer6.jpeg",
            "images/Designer7.jpeg",
            "images/Designer8.jpeg",
            "images/Designer9.jpeg",
            "images/Designer10.jpeg",
            "images/Designer11.jpeg"
        ];

        document.addEventListener('DOMContentLoaded', () => {
            // Click event to open modal for each image
            document.querySelectorAll('.gallery-item img').forEach((image, index) => {
                const imageId = `image-${index}`; // Assign a unique ID to each image

                // Initialize like count and comments for each image if not already set
                if (!likeCounts[imageId]) {
                    likeCounts[imageId] = 0;
                }
                if (!comments[imageId]) {
                    comments[imageId] = [];
                }

                image.addEventListener('click', () => {
                    currentImageIndex = index; // Set the current index to the clicked image index
                    openModal(imageId);
                });
            });

            // Like button functionality
            document.getElementById('likeButton').addEventListener('click', () => {
                const modalImage = document.getElementById('modalImage');
                const imageId = modalImage.dataset.imageId;
                likeCounts[imageId]++; // Increment like count for the current image
                document.getElementById('likeCount').innerText = `${likeCounts[imageId]} Likes`;
            });

            // Add comment functionality
            document.getElementById('addCommentButton').addEventListener('click', () => {
                const commentInput = document.getElementById('commentInput');
                const commentText = commentInput.value.trim();
                const modalImage = document.getElementById('modalImage');
                const imageId = modalImage.dataset.imageId;

                if (commentText) {
                    // Add comment to the comments array for the current image
                    comments[imageId].push(commentText);
                    displayComments(imageId); // Update the displayed comments
                    commentInput.value = ''; // Clear input field
                }
            });

            // Next and Previous button functionalities
            document.getElementById('nextButton').addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % images.length; // Go to the next image
                openModal(`image-${currentImageIndex}`); // Open the modal with the next image
            });

            document.getElementById('prevButton').addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length; // Go to the previous image
                openModal(`image-${currentImageIndex}`); // Open the modal with the previous image
            });
        });

        // Function to open modal and display the selected image
        function openModal(imageId) {
            const imageUrl = images[currentImageIndex]; // Get the image URL based on the current index
            const modalImage = document.getElementById('modalImage');
            modalImage.src = imageUrl;
            modalImage.dataset.imageId = imageId; // Store the image ID in a data attribute

            // Display the like count and comments for the clicked image
            document.getElementById('likeCount').innerText = `${likeCounts[imageId]} Likes`;
            displayComments(imageId);

            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
        }

        // Function to display comments for a specific image
        function displayComments(imageId) {
            const commentSection = document.getElementById('commentSection');
            commentSection.innerHTML = ''; // Clear previous comments

            // Display each comment for the current image
            comments[imageId].forEach(comment => {
                const commentElement = document.createElement('p');
                commentElement.textContent = comment;
                commentSection.appendChild(commentElement);
            });
        }