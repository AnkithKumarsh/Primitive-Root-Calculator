import java.util.*;

public class PrimitiveRoot {

    // Function to compute GCD
    public static int gcd(int a, int b) {
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Function to compute (base^exponent) % modulus
    public static int power(int base, int exponent, int modulus) {
        int result = 1;
        base = base % modulus;
        while (exponent > 0) {
            if ((exponent & 1) == 1)
                result = (result * base) % modulus;
            exponent = exponent >> 1;
            base = (base * base) % modulus;
        }
        return result;
    }

    // Function to compute Euler's Totient (phi)
    public static int phi(int n) {
        int result = n;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                while (n % i == 0)
                    n /= i;
                result -= result / i;
            }
        }
        if (n > 1)
            result -= result / n;
        return result;
    }

    // Function to find order of r modulo n
    public static int order(int r, int n) {
        int result = 1;
        int value = r % n;
        while (value != 1) {
            value = (value * r) % n;
            result++;
            if (result > n)
                return -1; // No order
        }
        return result;
    }

    public static List<Integer> findPrimitiveRoots(int n) {
        List<Integer> primitiveRoots = new ArrayList<>();
        int phiN = phi(n);

        for (int r = 2; r < n; r++) {
            if (gcd(r, n) == 1 && order(r, n) == phiN) {
                primitiveRoots.add(r);
            }
        }

        return primitiveRoots;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter a number to find its primitive roots: ");
        int n = scanner.nextInt();

        List<Integer> primitiveRoots = findPrimitiveRoots(n);

        if (!primitiveRoots.isEmpty()) {
            System.out.println("Primitive roots of " + n + " are: " + primitiveRoots);
        } else {
            System.out.println("No primitive roots exist for " + n);
        }

        scanner.close();
    }
}
