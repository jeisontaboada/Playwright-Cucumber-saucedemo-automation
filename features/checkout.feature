@HU-003 @checkout
Feature: HU-003 Proceso de checkout y compra
    Como usuario de Sauce Demo
    Quiero poder completar el proceso de compra
    Para adquirir los productos que necesito

    Background:
        Given el usuario está en la página de login
        When el usuario ingresa credenciales válidas de usuario estándar
        And el usuario está en la página de productos
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        And el usuario navega al carrito

    @ES-009 @smoke @happy_path
    Scenario: ES-009 Completar compra exitosamente
        When el usuario procede al checkout
        And el usuario completa la información del checkout con:
            | firstName | lastName | postalCode |
            | Jeison     | Taboada    | 15701      |
        And el usuario continúa al resumen del checkout
        Then el usuario debería ver el resumen de la orden
        And el producto "Sauce Labs Backpack" debería estar en el resumen
        When el usuario finaliza la compra
        Then el usuario debería ver la confirmación de la orden
        And el mensaje de confirmación debería contener "Thank you for your order"

    @ES-010 @ES-011 @unhappy_path
    Scenario Outline: ES-010-011 Checkout fallido con datos obligatorios incompletos
        When el usuario procede al checkout
        And el usuario ingresa el nombre "<firstName>" en checkout
        And el usuario continúa al resumen del checkout
        Then el usuario debería ver un mensaje de error
        And el mensaje de error debería contener "<errorMessage>"

        Examples:
            | firstName | errorMessage           |
            |           | First Name is required |
            | Jeison     | Last Name is required  |

    @ES-012 @happy_path
    Scenario: ES-012 Cancelar checkout y volver al carrito
        When el usuario procede al checkout
        And el usuario cancela el checkout
        Then el título de la página debería ser "Your Cart"

    @ES-013 @happy_path
    Scenario: ES-013 Verificar información en resumen de orden
        When el usuario procede al checkout
        And el usuario completa la información del checkout con:
            | firstName | lastName | postalCode |
            | Jefry     | Ramirez  | 16702      |
        And el usuario continúa al resumen del checkout
        Then el usuario debería ver el resumen de la orden
        And el subtotal debería ser mayor a 0
        And el impuesto debería ser mayor a 0
        And el total debería ser igual al subtotal más el impuesto