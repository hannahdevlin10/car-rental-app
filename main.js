const api = 'https://www.cartrawler.com/ctabe/cars.json';
    // fetch json data
    fetch(api)
        .then(response => response.json())
        .then(json => appendData(json[0].VehAvailRSCore))
        .catch(err => console.log('Request failed: ', err));

    const getVendorIcon = (vendor) => {
        switch (vendor) {
            case 'ALAMO':
                return "./assets/imgs/alamo.svg"
            case 'AVIS':
                return "./assets/imgs/avis.svg"
            case 'HERTZ':
                return "./assets/imgs/hertz.svg"
            default:
                break;
        }
    }

    const getStatusIcon = (status) => {
       if (status === 'Available' || status === 'true') {
           return "fas fa-check-circle"
       } else {
           return "fas fa-times-circle"
       }
    }

    // toggle custom modal for viewing car details
    const viewCar = (id) => {
        let x = document.getElementById(id);
        x.classList.toggle("show");
    }

    // sort car by price
    const sortListCars = () => {
        var carList, switching, b, dir, shouldSwitch, switchcount = 0;
        carList = document.getElementById('carListItems');
        switching = true;
        dir = "asc";

        while (switching) {
            switching = false;
            b = carList.getElementsByClassName("car-list-item");
            for (i = 0; i < (b.length - 1); i++) {
            shouldSwitch = false;

            let valueA = b[i].children.item(0).getElementsByClassName("car-list-item-price")[0].innerHTML.replace('$CAN ','');
            let valueB = b[i + 1].children.item(0).getElementsByClassName("car-list-item-price")[0].innerHTML.replace('$CAN ','');

            if (dir == "asc") {
                if (Number(valueA) > Number(valueB)) {
                shouldSwitch = true;
                break;
                }
            } else if (dir == "desc") {
                if (Number(valueA) < Number(valueB)) {
                shouldSwitch= true;
                break;
                }
            }
            }
            if (shouldSwitch) {
                b[i].parentNode.insertBefore(b[i + 1], b[i]);
                switching = true;
                switchcount ++;
            } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
            }
        }
    }

    // adds data to UI
    const appendData = (data) => {
        let availableCars = [];

        // Rental car models (car info) and car vendors
        let carData = data.VehVendorAvails;

        // Rental Date & Time
        let timeLocInfo = data.VehRentalCore;

        let convertPickUpDate = new Date(timeLocInfo['@PickUpDateTime']);
        let pickUpDate = String(convertPickUpDate).slice(0,15);
        let pickUpTime = String(convertPickUpDate).slice(16, 28);

        let convertReturnDate = new Date(timeLocInfo['@ReturnDateTime']);
        let returnDate = String(convertReturnDate).slice(0,15);
        let returnTime = String(convertReturnDate).slice(16, 28);

        let toolbar = document.getElementById("rentalDateTime");
        let timeLocInfoDiv = document.createElement('div');
        timeLocInfoDiv.className = "time-loc-info";
        timeLocInfoDiv.id = ("timeLocInfoDiv");
        timeLocInfoDiv.innerHTML =
        `
            <div style="display: flex; justify-content: space-between;">
                <div class="legend">Legend</div>
                <div class="pickup-table">
                    <div>
                        <b>Pick Up</b>
                    </div>
                    <div>
                        <span>${pickUpDate} |</span>
                        <span> ${pickUpTime}</span>
                    </div>
                </div>
                <div class="return-table">
                    <div>
                        <b>Return</b>
                    </div>
                    <div>
                        <span>${returnDate} |</span>
                        <span> ${returnTime}</span>
                    </div>
                </div>
            </div>
        `
        // display pick up & return date + time
        toolbar.appendChild(timeLocInfoDiv);

        for (var i = 0; i < carData.length; i++) {
            let newData = Object.entries(carData[i]);
            let currentVendor = newData[0][1]['@Name'];
            let currentVendorCode = newData[0][1]['@Code']
            for (var x = 0; x < newData.length; x++) {
                let carList = newData[1][1];
                for (var y = 0; y < carList.length; y++) {
                    let rateTotal = Math.round(carList[y].TotalCharge['@RateTotalAmount']);
                    let isAvailable = carList[y]['@Status'];
                    let hasAirCon = carList[y].Vehicle['@AirConditionInd'];
                    availableCars.push({
                       id: currentVendorCode + carList[y].Vehicle.VehMakeModel['@Name'].replace('or similar','').replace(' ', ''),
                       vendor: currentVendor,
                       carMakeModel: carList[y].Vehicle,
                       total: rateTotal,
                       status: getStatusIcon(isAvailable),
                       airCon: getStatusIcon(hasAirCon),
                       icon: getVendorIcon(currentVendor)
                    });
                }
            }
        }

        // main div which displays car items
        let mainCarList = document.getElementById('carListItems');
        let key = 'id';

        // remove duplicates by key (uses custom id for each car)
        const arrayUniqueByKey = [...new Map(availableCars.map(item => [item[key], item])).values()];

        arrayUniqueByKey?.forEach((car) => {
            let div = document.createElement('div');
            div.className = "car-list-item";
            div.id = "carListItem";

            div.innerHTML =
            `
                <div>
                    <div class="car-list-item-header">
                        <div>
                            ${car?.carMakeModel?.VehMakeModel['@Name'].replace('or similar','')}
                        </div>
                        <div>
                            <img src=${car?.icon} class="car-list-item-vendor-icon" />
                        </div>
                    </div>
                    <div class="car-list-item-subtext">or similar</div>
                    <div class="car-list-item-img-container">
                        <img src=${car?.carMakeModel?.PictureURL} alt="car-img" class="car-list-item-img" />
                    </div>
                    <div class="car-list-item-content">
                        <table class="car-list-item-table">
                            <tr>
                                <td class="car-info-prop">Transmission: </td>
                                <td class="car-info-value">${car?.carMakeModel['@TransmissionType']}</td>
                            </tr>
                            <tr>
                                <td class="car-info-prop">Fuel: </td>
                                <td class="car-info-value">${car?.carMakeModel['@FuelType']}</td>
                            </tr>
                            <tr>
                                <td class="car-info-prop">Passengers: </td>
                                <td class="car-info-value">${car?.carMakeModel['@PassengerQuantity']}</td>
                            </tr>
                        </table>
                        <div class="car-list-item-price" style="text-align: center">
                           $CAN ${car.total}
                        </div>
                    </div>
                    <div style="width: 225px; margin: auto !important;">
                        <div id="${car.id}" class="show-hide-div">
                            <div>
                                <table>
                                    <tr>
                                        <td class="car-info-prop">Transmission: </td>
                                        <td class="car-info-value">${car?.carMakeModel['@TransmissionType']}</td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Fuel: </td>
                                        <td class="car-info-value">${car?.carMakeModel['@FuelType']}</td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Passengers: </td>
                                        <td class="car-info-value">${car?.carMakeModel['@PassengerQuantity']}</td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Air Conditioning: </td>
                                        <td class="car-info-value"><i class="${car.airCon}"></i></td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Baggage Quantity: </td>
                                        <td class="car-info-value">${car?.carMakeModel['@BaggageQuantity']}</td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Doors: </td>
                                        <td class="car-info-value">${car?.carMakeModel['@DoorCount']}</td>
                                    </tr>
                                    <tr>
                                        <td class="car-info-prop">Available: </td>
                                        <td class="car-info-value"><i class="${car.status}"></i></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <button class="car-list-item-view-btn" onclick="viewCar('${car.id}');">
                            Details
                        </button>
                    </div>
                </div>
            `;

            // returns car list
            mainCarList.appendChild(div);
        })
    }